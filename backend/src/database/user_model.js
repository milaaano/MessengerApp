export class User {
    constructor({email, full_name, password_hash, profile_pic = ''}) {
        this.id = null;
        this.email = email;
        this.full_name = full_name;
        this.password_hash = password_hash;
        this.profile_pic = profile_pic;
        this.created_at = new Date();
        this.updated_at = new Date();
    }

    async save(pool) {
        const query = {
            text: "INSERT INTO users (email, full_name, password_hash, profile_pic, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6)",
            values: [this.email, this.full_name, this.password_hash, this.profile_pic, this.created_at, this.updated_at]
        };

        await pool.query(query);
    }

    static async findByEmail(pool, email) {
        const query = {
            text: "SELECT id, email, full_name, password_hash, profile_pic, created_at, updated_at FROM users WHERE email = $1",
            values: [this.email]
        };

        const res = await pool.query(query);

        if (!res.length) return null;

        return new User(res[0]);
    }

    


}