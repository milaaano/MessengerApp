export class Model {
    static updatable_columns = new Set();
    static queries = {};
    static table = "";
    static save_columns = [];

    async save(pool) {
        const cls = this.constructor;
        const cols = cls.save_columns;

        if (!Array.isArray(cols) || !cols.length) throw new Error(`${cls.name}.save_columns must be set`);

        const query = {
            text: cls.queries.save,
            values: cols.map(col => this[col])
        };

        const { rows } = await pool.query(query);

        if (!rows.length) return null;

        return new this.constructor(rows[0]);
    }

    static async findByEmail(pool, email) {
        const query = {
            text: this.queries.findByEmail,
            values: [email]
        };

        const { rows } = await pool.query(query);

        if (!rows.length) return null;

        return new this(rows[0]);
    }

    static async findById(pool, id) {
        const query = {
            text: this.queries.findById,
            values: [id]
        };

        const { rows } = await pool.query(query);

        if (!rows.length) return null;

        return new this(rows[0]);
    }

    async update() {}

    static async findByIdAndUpdate(pool, id, data, config = { new: true }) {
        const model = await this.findById(pool, id);

        if (!model) throw new Error(`${this.name} does not exist.`);

        try {
            const updated = await model.update(pool, data);
            if (config?.new) {
                return updated;
            }

            return model;
        } catch (err) {
            throw(err);
        }
    }

    exclude(fields) {
        const res = new this.constructor(this);
        for (const field of fields) {
            delete res[field];
        }

        return res;
    }

}