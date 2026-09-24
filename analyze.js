async function analyze() {
    const question = questionInput.value.trim() || 'What should I look for?';
    const text = textInput.value.trim();
    const hasFile = fileInput.files.length > 0;
    if (!text && !hasFile) {
        textInput.focus();
        textInput.style.setProperty('color', '#b26b5e');
        setTimeout(() => textInput.style.removeProperty('color'), 700);
        return;
    }

    const apiUrl = 'https://royal-glade-591a.ahreurink.workers.dev';
    const apiKey = document.querySelector('#apiKeyInput').value.trim() || localStorage.getItem('clarity-api-key');
    if (!apiKey) {
        settingsModal.hidden = false;
        document.querySelector('#apiKeyInput').focus();
        return;
    }

    sendButton.disabled = true;
    sendButton.setAttribute('aria-busy', 'true');
    emptyState.hidden = true;
    answerState.hidden = false;
    document.querySelector('#answerText').classList.remove('answer-yes', 'answer-no');
    document.querySelector('#answerHeading').textContent = 'Analyzing your text…';
    document.querySelector('#answerText').textContent = 'Clarity is waiting for the model response.';
    confidenceValue.textContent = '—';
    confidenceMeter.style.width = '0';
    confidenceNote.textContent = 'Request in progress';
    confidenceLabel.textContent = 'Analyzing';
    document.querySelector('.pulse').classList.add('active');

    try {
        console.log("Url = ", apiUrl);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'openjev-latest',
                state: text,
                questions: {
                    question: {
                        type: 'noul',
                        instructions: question
                    }
                }
            })
        });

        const contentType = response.headers.get('content-type') || '';
        const result = contentType.includes('application/json')
            ? await response.json()
            : await response.text();
        if (!response.ok) {
            const message = typeof result === 'string'
                ? result
                : result?.error || result?.message || JSON.stringify(result);
            throw new Error(`${response.status}: ${message}`);
        }

        const score = Number(result?.answers?.question?.noul);
        if (!Number.isFinite(score)) {
            throw new Error('The response did not contain a numeric answers.question.noul value.');
        }

        const answer = score > 0.5 ? 'Yes' : 'No';
        const confidence = score < 0.5 ? 1 - score : score;
        const percentage = Math.min(1, Math.max(0, confidence)) * 100;
        const answerText = document.querySelector('#answerText');
        document.querySelector('#answerHeading').textContent = question.endsWith('?')
            ? 'Here’s the clearest answer.' : 'Here’s what stands out.';
        answerText.textContent = answer;
        answerText.classList.remove('answer-yes', 'answer-no');
        answerText.classList.add(answer === 'Yes' ? 'answer-yes' : 'answer-no');
        confidenceValue.textContent = percentage.toFixed(2);
        confidenceMeter.style.width = `${percentage}%`;
        confidenceNote.textContent = 'Response received from Codiv';
        confidenceLabel.textContent = 'Analysis complete';
    } catch (error) {
        document.querySelector('#answerHeading').textContent = 'Analysis could not be completed.';
        document.querySelector('#answerText').textContent = error.message || 'The analysis request failed. Check your API key and try again.';
        confidenceNote.textContent = 'Request failed';
        confidenceLabel.textContent = 'Connection error';
        document.querySelector('.pulse').classList.remove('active');
    } finally {
        sendButton.disabled = false;
        sendButton.removeAttribute('aria-busy');
    }
}
