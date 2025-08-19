import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend.env') });

import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import auth_routes from './routes/auth_routes.js';
import message_routes from './routes/message_routes.js';
import { parseJSONBody, runHandler } from './lib/utils.js';

const server = http.createServer(async (req, res) => {
    const { url, method } = req;

    try {
        req.body = await parseJSONBody(req);
    } catch (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain' })
        return res.end(JSON.stringify({ error: err.message }));
    }

    let route;
    if (url.startsWith('/api/auth')) {
        route = auth_routes['/' + url.split('/')[3]];
    } else if (url.startsWith('/api/message')) {
        route = message_routes['/' + url.split('/')[3]];
    }

    if (route && route[method]) {
        runHandler(route[method], req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("Not Found");
    }
});


server.listen(process.env.PORT, () => {
    console.log(`HTTP server is running on port: ${process.env.PORT}`);
});