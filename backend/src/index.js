import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import auth_routes from './routes/auth_routes.js';
import message_routes from './routes/message_routes.js';
import { parseJSONBody, runHandler, findMatchURL } from './lib/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend.env') });

const routes = {...auth_routes, ...message_routes};

const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", process.env.CLIENT_ALLOWED_METHODS);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }


    const { url, method } = req;
    const match = findMatchURL(url, routes);

    if (!match) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Not Found' }));
    }

    try {
        req.body = await parseJSONBody(req);
    } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: err.message }));
    }

    const route = match.route;
    req.pathname = match.parsed.pathname;
    req.params = match.parsed.params;
    req.query_string = match.parsed.query_string;
    req.parts = match.parsed.parts;

    if (route && route[method]) {
        runHandler(route[method], req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Not Found' }));
    }
});


server.listen(process.env.PORT, () => {
    console.log(`HTTP server is running on port: ${process.env.PORT}`);
});