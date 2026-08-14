const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const urlPath = req.url.split('?')[0];

    // API: Get Configuration
    if (urlPath === '/api/config' && req.method === 'GET') {
        const configPath = path.join(PUBLIC_DIR, 'config.json');
        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Config file not found' }));
        }
        return;
    }

    // API: Save Configuration and Update Local Files Permanently
    if (urlPath === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const newConfig = JSON.parse(body);
                const configPath = path.join(PUBLIC_DIR, 'config.json');
                const scriptPath = path.join(PUBLIC_DIR, 'script.js');
                const htmlPath = path.join(PUBLIC_DIR, 'index.html');

                // 1. Save config.json
                fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');

                // 2. Permanently update default constants in script.js
                if (fs.existsSync(scriptPath)) {
                    let scriptContent = fs.readFileSync(scriptPath, 'utf8');

                    if (newConfig.recipient) {
                        scriptContent = scriptContent.replace(
                            /recipient:\s*".*?"/,
                            `recipient: "${newConfig.recipient.replace(/"/g, '\\"')}"`
                        );
                    }
                    if (newConfig.birthMonth) {
                        scriptContent = scriptContent.replace(
                            /birthMonth:\s*\d+/,
                            `birthMonth: ${parseInt(newConfig.birthMonth, 10)}`
                        );
                    }
                    if (newConfig.birthDay) {
                        scriptContent = scriptContent.replace(
                            /birthDay:\s*\d+/,
                            `birthDay: ${parseInt(newConfig.birthDay, 10)}`
                        );
                    }
                    if (newConfig.numCandles) {
                        scriptContent = scriptContent.replace(
                            /numCandles:\s*\d+/,
                            `numCandles: ${parseInt(newConfig.numCandles, 10)}`
                        );
                    }
                    if (newConfig.candleColors) {
                        scriptContent = scriptContent.replace(
                            /candleColors:\s*\[.*?\]/s,
                            `candleColors: ${JSON.stringify(newConfig.candleColors)}`
                        );
                    }

                    fs.writeFileSync(scriptPath, scriptContent, 'utf8');
                }

                // 3. Permanently update HTML recipient title in index.html
                if (fs.existsSync(htmlPath) && newConfig.recipient) {
                    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
                    const recipient = newConfig.recipient;

                    htmlContent = htmlContent.replace(
                        /<title id="pageTitle">Happy Birthday .*?! 🎂 \| HeartCraft<\/title>/,
                        `<title id="pageTitle">Happy Birthday ${recipient}! 🎂 | HeartCraft</title>`
                    );

                    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'All local files (config.json, script.js, index.html) updated permanently on disk!'
                }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to update files: ' + err.message }));
            }
        });
        return;
    }

    // Handle Admin route
    let relativeFilePath = urlPath;
    if (urlPath === '/' || urlPath === '/index.html') {
        relativeFilePath = 'index.html';
    } else if (urlPath === '/admin' || urlPath === '/admin.html') {
        relativeFilePath = 'admin.html';
    }

    let filePath = path.join(PUBLIC_DIR, relativeFilePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 HeartCraft Server Running!`);
    console.log(`🌐 Recipient Site: http://localhost:${PORT}`);
    console.log(`🔐 Master Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`==================================================\n`);
});
