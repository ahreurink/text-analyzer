const questionInput = document.querySelector('#questionInput');
const textInput = document.querySelector('#textInput');
const characterCount = document.querySelector('#characterCount');
const sendButton = document.querySelector('#sendButton');
const clearButton = document.querySelector('#clearButton');
const emptyState = document.querySelector('#emptyState');
const answerState = document.querySelector('#answerState');
const confidenceValue = document.querySelector('#confidenceValue');
const confidenceMeter = document.querySelector('#confidenceMeter');
const confidenceNote = document.querySelector('#confidenceNote');
const confidenceLabel = document.querySelector('#confidenceLabel');
const fileInput = document.querySelector('#fileInput');
const sourceField = document.querySelector('#sourceField');
const fileField = document.querySelector('#fileField');
const settingsModal = document.querySelector('#settingsModal');

textInput.addEventListener('input', () => {
    characterCount.textContent = textInput.value.length.toLocaleString();
});

document.querySelectorAll('.mode-tab')
    .forEach((tab) => {
    tab.addEventListener('click', () => {
        const isFile = tab.dataset.mode === 'file';
        document.querySelectorAll('.mode-tab').forEach((item) => {
            item.classList.toggle('active', item === tab);
            item.setAttribute('aria-selected', item === tab);
        });
        sourceField.hidden = isFile;
        fileField.hidden = !isFile;
        sourceField.style.display = isFile ? 'none' : 'flex';
        fileField.style.display = isFile ? 'flex' : 'none';
        document.querySelector('.composer-hint').innerHTML = isFile
            ? '<span>↑</span> Upload a document to analyze it <span class="hint-separator">•</span> <span>TXT, MD, PDF, DOCX</span>'
            : '<span>↵</span> Press Enter to analyze <span class="hint-separator">•</span> <span>Shift + Enter</span> for a new line';
    });
});

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
        document.querySelector('.file-drop')
            .innerHTML = `<strong>${file.name}</strong><small>${(file.size / 1024)
            .toFixed(1)} KB · Ready to analyze</small>`;
    }
});

sendButton.addEventListener('click', analyze);
textInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        analyze();
    }
});
clearButton.addEventListener('click', () => {
    questionInput.value = '';
    textInput.value = '';
    fileInput.value = '';
    characterCount.textContent = '0';
    emptyState.hidden = false;
    answerState.hidden = true;
    confidenceValue.textContent = '—';
    confidenceMeter.style.width = '0';
    confidenceNote.textContent = 'Waiting for a question';
    confidenceLabel.textContent = 'No analysis yet';
    document.querySelector('.pulse').classList.remove('active');
});
document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        clearButton.click();
    }
});

document.querySelector('#settingsButton').addEventListener('click', () => {
    settingsModal.hidden = false;
    document.querySelector('#apiKeyInput').focus();
});
document.querySelector('#closeModal').addEventListener('click', () => {
    settingsModal.hidden = true;
});
settingsModal.addEventListener('click', (event) => {
    if (event.target === settingsModal) settingsModal.hidden = true;
});
document.querySelector('#saveSettings').addEventListener('click', () => {
    const key = document.querySelector('#apiKeyInput').value.trim();
    if (document.querySelector('#rememberKey').checked) {
        if (key) localStorage.setItem('clarity-api-key', key);
        else localStorage.removeItem('clarity-api-key');
    }
    document.querySelector('.status-dot').innerHTML = '<i></i> API connected';
    settingsModal.hidden = true;
});
const savedKey = localStorage.getItem('clarity-api-key');
if (savedKey) document.querySelector('.status-dot').innerHTML = '<i></i> API connected';
