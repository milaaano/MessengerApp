import jwt from 'jsonwebtoken';
import { User } from '../database/user_model.js';
import { parseCookies } from '../lib/utils.js';
import pool from '../database/database.js';


export const protectRoute = async (req, res, next) => {
    try {

        const token = parseCookies(req.headers.cookie).jwt;

        if (!token) {
            res.stausCode = 401;
            return res.end(JSON.stringify({ message: "Unauthorized: not token provided." }));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            res.stausCode = 401;
            return res.end(JSON.stringify({ message: "Unauthorized: not token provided." }));
        }

        const user = (await User.findById(pool, decoded.userId)).exclude(['password_hash']);

        if (!user) {
            res.stausCode = 400;
            return res.end(JSON.stringify({ message: "Unauthorized: user does not exist." }));
        }

        req.user = user;

        next()
    } catch (err) {
        console.log("Error in protectRoute middleware.");
        next(err);
    }
}