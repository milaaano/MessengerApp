export class User {
    constructor({id = null, email, full_name, password_hash, profile_pic = '', created_at = new Date(), updated_at = new Date()}) {
        this.id = id;
        this.email = email;
        this.full_name = full_name;
        this.password_hash = password_hash;
        this.profile_pic = profile_pic;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    async save(pool) {
        const query = {
            text: "INSERT INTO users (email, full_name, password_hash, profile_pic, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
            values: [this.email, this.full_name, this.password_hash, this.profile_pic, this.created_at, this.updated_at]
        };

        return await pool.query(query);
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
}