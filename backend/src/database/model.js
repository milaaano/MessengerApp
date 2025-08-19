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

    async update() {
        throw new Error(`${this.constructor.name}.update must be implemented`);
    }

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
        const data = { ...this };
        for (const f of fields) delete data[f];
        return new this.constructor(data);
    }

    // among is restricting object, except is excluding object, both should contain ids of entries.
    static async find(pool, config = { among: [], except: [] }) {
        const { among = [], except = [] } = config;
        const conditions = [];
        const values = [];

        let idx = 1;
        if (among.length) {
            conditions.push(`id = ANY($${idx++})`);
            values.push(among);
        }

        conditions.push(`id <> ALL($${idx++})`);
        values.push(except);

        const query = {
            text: `SELECT * FROM ${this.table} WHERE ${conditions.join(' AND ')}`,
            values
        }

        const { rows } = await pool.query(query);

        return rows.map(item => new this(item));
    }
}