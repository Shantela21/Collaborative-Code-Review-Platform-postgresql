import { User } from "models/userModel";
import { query } from "../config/database";


export const createUser = async(user : User) => {
    console.log(user);
    const { rows } = await query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,[user.name, user.email, user.password])
    return rows[0]
}
