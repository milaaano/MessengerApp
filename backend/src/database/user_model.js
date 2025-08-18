import { Model } from "./model.js";
export class User extends Model {
    static updatable_columns = new Set(['full_name', 'profile_pic', 'email', 'password_hash']);
    static queries = {
        save: "INSERT INTO users(email, full_name, password_hash, profile_pic) VALUES($1, $2, $3, $4) RETURNING *",
        findByEmail: "SELECT id, email, full_name, password_hash, profile_pic, created_at, updated_at FROM users WHERE email = $1",
        findById: "SELECT * FROM users WHERE id = $1",
    };
    static table = "users";
    static save_columns = ['email', 'full_name', 'password_hash', 'profile_pic'];

    constructor({id = null, email, full_name, password_hash, profile_pic = '', created_at = null, updated_at = null}) {
        super();
        this.id = (id !== null) ? Number(id) : null;
        this.email = email;
        this.full_name = full_name;
        this.password_hash = password_hash;
        this.profile_pic = profile_pic;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    async update(pool, data) {
        const cls = this.constructor;
        const setParts = [];
        const values = [this.id]; 

        let idx = 2;
        for (const key of Object.keys(data)) {
            if (!cls.updatable_columns.has(key)) continue;
            if (key !== 'profile_pic' && (data[key] === null || data[key] === undefined || data[key] === '')) continue;
            setParts.push(`${key} = $${idx++}`);
            values.push(data[key]);
        }

        if (setParts.length === 0) {
            throw new Error('No valid fields to update');
        }

        setParts.push(`updated_at = NOW()`);

        const query = {
            text: `UPDATE ${cls.table} SET ${setParts.join(', ')} WHERE id = $1 RETURNING *`,
            values: values
        };

        try {
            const { rows } = await pool.query(query);
            
            if (!rows.length) return null;

            return new User(rows[0]);
        } catch (err) {
            if (err.code === "23505") {
                throw new Error("Email already exists, please use another one.");
            }
            throw(err);
        }
    }
}