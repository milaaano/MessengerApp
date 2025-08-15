import { generateToken } from '../lib/utils.js';
import { User } from '../database/user_model.js';
import bcrypt from "bcryptjs";
// import cloudinary from '../lib/cloudinary.js';
import pool from '../database/database.js';


export const login = (req, res) => {
    res.writeHead(200, {"Content-Type": 'text/html'});
    res.end("Login Page");
};

export const signup = async (req, res) => {
    const { email, full_name, password } = req.body;

    try {
        if (!email || !full_name || !password) {
            res.writeHead(400, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify({message: "All fields are required"}));
            return res;
        }

        if (password.length < 6) {
            res.writeHead(400, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify({message: "Password must be at least 6 charachters"}));
            return res;
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
            const { id } = added_user.rows[0];
            generateToken(new_user.id, res);

            res.statusCode = 200;
            res.end(JSON.stringify({
                id,
                email: new_user.email,
                full_name: new_user.full_name,
                profile_pic: new_user.profile_pic
            }));
        } else {
            res.statusCode = 400;
            res.end(JSON.stringify({
                message: "Invalid user data"
            }));
        }

    } catch (err) {
        console.log("Error in signup controller:", err.message);
        res.statusCode = 500;
        res.end(JSON.stringify({message: "Internal Server Error"}));
    }
};

export const logout = (req, res) => {
    res.writeHead(200, {"Content-Type": 'text/html'});
    res.end("Logout Page");
};

export const getHomePage = (req, res) => {
    res.writeHead(200, {"Content-Type": 'text/html'});
    res.end("Home Page");
};