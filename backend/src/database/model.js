export class Model {
    static updatable_columns = new Set(); // columns that are allowed to be updated; to be defined in a subclass
    static queries = {}; // sql queries; to be defined in a subclasses
    static table = ""; // name of the table; to be defined in a subclass
    static save_columns = []; // columns that will be saved in database for new entry; to be defined in a subclass
    static filter_columns = new Set(); // columns that will can filetered by in database queries; to be defined in a subclass

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

    // helper function that is used in findByIdAndUpdate; must be implemented in a subclass
    async update() {
        throw new Error(`${this.constructor.name}.update must be implemented`);
    }

    // finds user in db by id and updates it; accepts pool, id, new data, config object which has one field new (if true return updated_user, otherwise initial user)
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

    // accepts and array of fiedls to be excluded from the object -> new object of the same type
    exclude(fields) {
        const data = { ...this };
        for (const f of fields) delete data[f];
        return new this.constructor(data);
    }

    // among - includes only given ids; except - excludes all the given ids; and/or - contains conditions (column: value) to be joined with AND/OR;
    static async find(pool, config = { among: [], except: [], or: [], and: []}) {
        const { among = [], except = [], and = [], or = [] } = config;
        const conditions = [];
        const values = [];

        let idx = 1;

        // among
        if (among.length) {
            conditions.push(`id = ANY($${idx++}::bigint[])`);
            values.push(among);
        }

        // except
        conditions.push(`id <> ALL($${idx++}::bigint[])`);
        values.push(except);

        // and
        and.forEach(item => {
            for (const key of Object.keys(item)) {
                if (this.filter_columns.has(key)) {
                    conditions.push(`${key} = $${idx++}`);
                    values.push(item[key]);
                }
            }
        });

        // or
        const or_conditions = [];
        or.forEach(item => {
            const part = [];
            for (const key of Object.keys(item)) {
                if (this.filter_columns.has(key)) {
                    part.push(`${key} = $${idx++}`);
                    values.push(item[key]);
                }
            }
            if (part.length) {
                or_conditions.push(`(${part.join(' AND ')})`);
            }
        });
        if (or_conditions.length) {
            conditions.push(`(${or_conditions.join(' OR ')})`);
        }

        const query = {
            text: `SELECT * FROM ${this.table} WHERE ${conditions.join(' AND ')}`,
            values
        }

        const { rows } = await pool.query(query);

        return rows.map(item => new this(item));
    }
}