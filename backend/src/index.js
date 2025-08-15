import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/auth_routes.js';
import { parseJSONBody } from './lib/utils.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend.env') });

const server = http.createServer(async (req, res) => {
    const { url, method } = req;

    try {
        req.body = await parseJSONBody(req);
    } catch (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain' })
        return res.end(JSON.stringify({ error: err.message }));
    }
    

    const route = routes[url];

    if (route && route[method]) {
        await route[method](req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("Not Found");
    }
});


server.listen(process.env.PORT, () => {
    console.log(`HTTP server is running on port: ${process.env.PORT}`);
});