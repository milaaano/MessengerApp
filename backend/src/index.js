import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import auth_routes from './routes/auth_routes.js';
import message_routes from './routes/message_routes.js';
import { parseJSONBody, runHandler, findMatchURL, parseCookies } from './lib/utils.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

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

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_ORIGIN,
        credentials: true,
    }
});

const userSocketsMap = new Map();

io.use((socket, next) => {
    try {
        if (!socket.handshake.headers.cookie) {
            throw new Error("Cannot connect: no cookies provided");
        }

        const token = parseCookies(socket.handshake.headers.cookie).jwt;

        if (!token) {
            throw new Error("Cannot connect: no token provided");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const delay = decoded.exp * 1000 - Date.now() - 30000;

        if (delay <= 0) {
            throw new Error("Connot connect: expired token");
        }

        socket.data.userId = decoded.userId;

        setTimeout(() => {
            socket.disconnect(true, "token_expired");
        }, delay);

        next();
    } catch (err) {
        next(err);
    }
});

io.on("connection", (socket) => {
    const userId = socket.data.userId;
    socket.join(`user:${userId}`);

    console.log('a user connected via ', socket.id);
    
    if (!userSocketsMap.has(userId)) {
        userSocketsMap.set(userId, new Set());
    }
    userSocketsMap.get(userId).add(socket.id);

    socket.emit("getOnlineUsers", Array.from(userSocketsMap.keys()));

    socket.on('disconnect', (message) => {
        userSocketsMap.get(userId).delete(socket.id);
        console.log(`Socket ${socket.id} was disconnected. Reason: ${message}`);

        if (userSocketsMap[userId].size === 0) userSocketsMap.delete(userId);
    });

});


server.listen(process.env.PORT, () => {
    console.log(`HTTP server is running on port: ${process.env.PORT}`);
});

export { io };