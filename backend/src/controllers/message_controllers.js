import { User } from '../database/user_model.js';
import { Message } from "../database/message_model.js";
import pool from '../database/database.js';

export const getUsersForSiderbar = async (req, res, next) => {
    try {
        const logged_user = req.user;
        const sidebar_users = (await User.find(pool, { except: [logged_user.id] })).map(item => item.exclude(['password_hash']));

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(sidebar_users));
    } catch (err) {
        console.log("Error in getUserForSidebar.");
        next(err);
    }
}