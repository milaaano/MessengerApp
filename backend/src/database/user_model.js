export class User {
    constructor({id = null, email, full_name, password_hash, profile_pic = '', created_at = null, updated_at = null}) {
        this.id = (id !== null) ? Number(id) : null;
        this.email = email;
        this.full_name = full_name;
        this.password_hash = password_hash;
        this.profile_pic = profile_pic;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static #allowed_columns = new Set(['full_name', 'profile_pic', 'email', 'password_hash']);

    async save(pool) {
        const query = {
            text: "INSERT INTO users(email, full_name, password_hash, profile_pic) VALUES($1, $2, $3, $4) RETURNING *",
            values: [this.email, this.full_name, this.password_hash, this.profile_pic]
        };

        const { rows } = await pool.query(query);

        if (!rows.length) return null;

        return new User(rows[0]);
    }

    static async findByEmail(pool, email) {
        const query = {
            text: "SELECT id, email, full_name, password_hash, profile_pic, created_at, updated_at FROM users WHERE email = $1",
            values: [email]
        };

        const { rows } = await pool.query(query);

        if (!rows.length) return null;

        return new User(rows[0]);
    }

    static async findById(pool, id) {
        const query = {
            text: "SELECT * FROM users WHERE id = $1",
            values: [id]
        };

        const { rows } = await pool.query(query);

        if (!rows.length) return null;

        return new User(rows[0]);
    }


    async #update(pool, data) {
        const setParts = [];
        const values = [this.id]; 

        let idx = 2;
        for (const key in data) {
            if (!User.#allowed_columns.has(key)) continue;
            setParts.push(`${key} = $${idx++}`);
            values.push(data[key]);
        }

        if (setParts.length === 0) {
            throw new Error('No valid fields to update');
        }

        setParts.push(`updated_at = NOW()`);

        const query = {
            text: `UPDATE users SET ${setParts.join(', ')} WHERE id = $1 RETURNING *`,
            values: values
        };

        const { rows } = await pool.query(query);

        if (!rows.length) return null;

        return new User(rows[0]);
    }

    static async findByIdAndUpdate(pool, id, data, config = { new: true }) {
        const user = await User.findById(pool, id);

        if (!user) throw new Error("User does not exist.");

        try {
            const updated = await user.#update(pool, data);
            if (config?.new) {
                return updated;
            }

            return user;
        } catch (err) {
            if (err.code === "23505") {
                throw new Error("Email already exists, please use another one.");
            }
            throw(err);
        }
    }
}