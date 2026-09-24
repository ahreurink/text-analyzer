For local development, serve the application on a webserver on port 8000 (``)

The CODIV api calls are routed through a Cloudflare worker with the following setup


```javascript
const ALLOWED_ORIGINS = new Set([
    'http://localhost:8000',
    'https://ahreurink.github.io'
]);

function corsHeaders(origin) {
    const headers = new Headers({
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Vary': 'Origin'
    });

    if (ALLOWED_ORIGINS.has(origin)) {
        headers.set('Access-Control-Allow-Origin', origin);
    }

    return headers;
}

function jsonResponse(body, status, origin) {
    const headers = corsHeaders(origin);
    headers.set('Content-Type', 'application/json');
    return new Response(JSON.stringify(body), {status, headers});
}

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin') || '';
        const isAllowedOrigin = ALLOWED_ORIGINS.has(origin);

        if (request.method === 'OPTIONS') {
            if (!isAllowedOrigin) {
                return new Response('Forbidden', {status: 403});
            }
            return new Response(null, {status: 204, headers: corsHeaders(origin)});
        }

        if (!isAllowedOrigin) {
            return jsonResponse({error: 'Origin not allowed'}, 403, origin);
        }

        if (request.method !== 'POST') {
            return jsonResponse({error: 'Method not allowed'}, 405, origin);
        }

        const authorization = request.headers.get('Authorization');
        if (!authorization) {
            return jsonResponse({error: 'Authorization header is required'}, 401, origin);
        }

        const body = await request.text();

        try {
            const upstream = await fetch('https://api.codiv.ai/v1/systemone', {
                method: 'POST',
                headers: {
                    Authorization: authorization,
                    'Content-Type': 'application/json'
                },
                body
            });

            const responseHeaders = corsHeaders(origin);
            responseHeaders.set(
                'Content-Type',
                upstream.headers.get('Content-Type') || 'application/json'
            );

            return new Response(upstream.body, {
                status: upstream.status,
                statusText: upstream.statusText,
                headers: responseHeaders
            });
        } catch {
            return jsonResponse({error: 'Could not reach Codiv'}, 502, origin);
        }
    }
};

```