// ============================================
// TextAIPRO - Local Development Server
// ============================================
// Run with: node server.js
// Then open: http://localhost:3000

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables from .env
import { config } from 'dotenv';
config();

// Import the API handler
import handler from './api/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    // Handle API routes
    if (url.pathname === '/api/gemini') {
        try {
            // Collect request body
            let body = '';
            for await (const chunk of req) {
                body += chunk;
            }

            // Create a Request-like object for the handler
            const request = {
                method: req.method,
                json: async () => JSON.parse(body || '{}'),
            };

            // Call the handler
            const response = await handler(request);

            // Get response data
            const responseBody = await response.text();

            // Set headers
            res.writeHead(response.status, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            });

            res.end(responseBody);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        });
        res.end();
        return;
    }

    // Serve static files
    let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
    filePath = join(__dirname, filePath);

    if (!existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
    }

    const ext = extname(filePath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
        const content = readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(content);
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error');
    }
});

server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║           TextAIPRO Development Server                ║
╠═══════════════════════════════════════════════════════╣
║  🚀 Server running at: http://localhost:${PORT}          ║
║  📁 Serving files from: ${__dirname}
║  🔑 API Keys loaded: ${process.env.API_KEYS_POOL ? process.env.API_KEYS_POOL.split(',').length : 0} keys
╚═══════════════════════════════════════════════════════╝
    `);
});
