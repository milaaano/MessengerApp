import { send } from "process";
import { Model } from "./model.js";
export class Message extends Model {
    static updatable_columns = new Set(['picture', 'content']);
    static queries = {
        save: "INSERT INTO messages(sender_id, receiver_id, content, picture) VALUES($1, $2, $3, $4) RETURNING *",
        findById: "SELECT * FROM messages WHERE id = $1",
    };
    static table = "messages";
    static save_columns = ['sender_id', 'receiver_id', 'content', 'picture'];
    static filter_columns = new Set(['id', 'sender_id', 'receiver_id', 'content', 'picture', 'created_at', 'updated_at']);

    constructor({id = null, sender_id, receiver_id, content = "", picture = "", created_at = null, updated_at = null}) {
        super();
        const sid = Number(sender_id);
        const rid = Number(receiver_id);

        if (!Number.isInteger(sid) || sid <= 0) {
            throw new Error(`Invalid sender_id: ${sender_id}`);
        }
        if (!Number.isInteger(rid) || rid <= 0) {
            throw new Error(`Invalid receiver_id: ${receiver_id}`);
        }
        if (sid === rid) throw new Error("sender_id cannot be equal to receiver_id");

        this.id = (id !== null) ? Number(id) : null;
        this.sender_id = sid;
        this.receiver_id = rid;
        this.content = content;
        this.picture = picture;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    // updates database; if both picture and content are empty, throws an error
    async update(pool, data) {
        const cls = this.constructor;
        const setParts = [];
        const values = [this.id]; 

        if (!data.picture && !data.content) throw new Error("Empty messages are not allowed.");

        let idx = 2;
        for (const key of Object.keys(data)) {
            if (!cls.updatable_columns.has(key)) continue;
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

        const { rows } = await pool.query(query);
            
        if (!rows.length) return null;

        return new cls(rows[0]);
    }

    static async findByEmail() {
        throw new Error("findByEmail is not supported for Message");
    }
}