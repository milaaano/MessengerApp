import { generateToken, setCookie } from '../lib/utils.js';
import { User } from '../database/user_model.js';
import bcrypt from "bcryptjs";
import cloudinary from '../lib/cloudinary.js';
import pool from '../database/database.js';


export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByEmail(pool, email);
        if (!user) {
            res.writeHead(400, {'Content-Type': 'text/html'});
            return res.end(JSON.stringify({message: `User ${email} does not exist.`}));
        }

        const is_password_correct = await bcrypt.compare(password, user.password_hash);

        if (!is_password_correct) {
            res.writeHead(400, {'Content-Type': 'text/html'});
            return res.end(JSON.stringify({message: `Wrong password.`}));
        }

        generateToken(user.id, res);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(user.exclude(['password_hash'])));

    } catch (err) {
        console.log("Error in controllers, login:", err.message);
        res.writeHead(500, {'Content-Type': 'text/html'});
        res.end(JSON.stringify({ message: "Internal server error." }));
    }
};

export const signup = async (req, res) => {
    const { email, full_name, password } = req.body;

    try {
        if (!email || !full_name || !password) {
            res.writeHead(400, {'Content-Type': 'text/html'});
            res.end(JSON.stringify({message: "All fields are required"}));
            return res;
        }

        if (email.length > 320) {
            res.writeHead(400, {'Content-Type': 'text/plain'});
            return res.end(JSON.stringify({message: "Email is too long"}));
        }

        if (full_name.length > 255) {
            res.writeHead(400, {'Content-Type': 'text/plain'});
            return res.end(JSON.stringify({message: "Name is too long"}));
        }

        if (password.length < 6) {
            res.writeHead(400, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify({message: "Password must be at least 6 charachters"}));
            return res;
        } else if (password.length > 1024) {
            res.writeHead(400, {'Content-Type': 'text/plain'});
            return res.end(JSON.stringify({message: "Password is to long"}));
        }


        const user = await User.findByEmail(pool, email);
        

        if (user) {
            res.writeHead(400, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify({message: `User with email ${email} already exists`}));
            return res;
        }
        

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);


        const new_user = new User({email, full_name, password_hash});

        if (new_user) {
            const added_user = await new_user.save(pool);
            const { id } = added_user.id;
            generateToken(added_user.id, res);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(added_user.exclude(['password_hash'])));
        } else {
            res.statusCode = 400;
            res.end(JSON.stringify({
                message: "Invalid user data"
            }));
        }

    } catch (err) {
        console.log("Error in signup controller:", err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({message: "Internal Server Error"}));
    }
};

export const logout = (req, res) => {
    try {
        setCookie(res, "jwt", "", { maxAge: 0, secure: process.env.NODE_ENV !== "dev" });
        res.writeHead(200, {"Content-Type": 'text/html'});
        res.end(JSON.stringify({ message: "Logged out successfully." }));
    } catch (err) {
        console.log("Error in logout handler: ", err);
        res.writeHead(500, {"Content-Type": 'text/html'});
        res.end(JSON.stringify({ message: "Internal server error" }));
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { profile_pic, email, full_name } = req.body; // will update everithing in the future, for now only profile_pic, so email and full_name are undefined

        const user = req.user;
        
        if (!user) throw new Error('User does not exist.');

        let pic_upload_res = "";
        if (profile_pic) {
            pic_upload_res = await cloudinary.uploader.upload(profile_pic);
        }

        const updated_user = await User.findByIdAndUpdate(
            pool,
            user.id,
            { profile_pic: pic_upload_res ? pic_upload_res.secure_url : pic_upload_res, email, full_name },
            { new: true }
        );

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(updated_user.exclude(['password_hash'])));
    } catch (err) {
        console.log("Error in updateProfile");
        next(err);
    }
}

export const checkAuth = (req, res, next) => {
    try {
        if (!req.user) throw new Error("User does not exist.");
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(req.user));
    } catch (err) {
        console.log("Error in checkAuth.");
        next(err);
    }
}