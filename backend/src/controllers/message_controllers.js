import { User } from '../database/user_model.js';
import { Message } from "../database/message_model.js";
import pool from '../database/database.js';
import { parseURL } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js';

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
};

export const getMessages = async (req, res, next) => {
    try {
        const logged_user_id = req.user.id;
        const parsed_url = parseURL(req.url, '/api/message/:id');

        if (!parsed_url) throw new Error("URL and pattern mimatch.");

        const receiver_id = parsed_url.params.id;

        const messages = await Message.find(pool, { or: [
            {sender_id: logged_user_id, receiver_id: receiver_id},
            {sender_id: receiver_id, receiver_id: logged_user_id}
        ]});

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(messages));
    } catch (err) {
        console.log("Error in getMessages function.");
        next(err);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const sender = req.user.id;

    } catch (err) {

    }
};