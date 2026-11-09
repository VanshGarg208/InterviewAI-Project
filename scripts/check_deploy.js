#!/usr/bin/env node
const https = require('https');
const http = require('http');
const { URL } = require('url');

function parseArgs(args) {
    const res = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].slice(2);
            res[key] = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
        }
    }
    return res;
}

function request(opts, body) {
    return new Promise((resolve, reject) => {
        const lib = opts.protocol === 'https:' ? https : http;
        const req = lib.request(opts, (res) => {
            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => {
                const text = Buffer.concat(chunks).toString();
                resolve({ statusCode: res.statusCode, headers: res.headers, body: text });
            });
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function main() {
    const argv = parseArgs(process.argv.slice(2));
    const backend = argv.backend || 'https://interviewai-backend-project.onrender.com';
    const origin = argv.origin || 'https://interviewai-backend-project-1.onrender.com';

    console.log('Testing InterviewAI Deployment Configuration:');
    console.log('  Backend:', backend);
    console.log('  Origin header for CORS check:', origin);

    const url = new URL(backend + '/api/auth');
    const opts = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'OPTIONS',
        headers: {
            Origin: origin,
            'Access-Control-Request-Method': 'GET',
        },
    };

    try {
        const res = await request(opts);
        console.log('\nCORS Pre-Flight (OPTIONS /api/auth):');
        console.log('  Status code:', res.statusCode);
        console.log('  access-control-allow-origin:', res.headers['access-control-allow-origin'] || 'NONE');
        console.log('  access-control-allow-credentials:', res.headers['access-control-allow-credentials'] || 'NONE');

        // Check health endpoint
        const healthUrl = new URL(backend + '/api/health');
        const healthOpts = {
            protocol: healthUrl.protocol,
            hostname: healthUrl.hostname,
            port: healthUrl.port || (healthUrl.protocol === 'https:' ? 443 : 80),
            path: healthUrl.pathname,
            method: 'GET',
            headers: { Origin: origin },
        };
        const healthRes = await request(healthOpts);
        console.log('\nHealth Check (GET /api/health):');
        console.log('  Status code:', healthRes.statusCode);
        console.log('  Response body:', healthRes.body);
    } catch (err) {
        console.error('Error during deployment checks:', err.message || err);
        process.exitCode = 2;
    }
}

if (require.main === module) main();
