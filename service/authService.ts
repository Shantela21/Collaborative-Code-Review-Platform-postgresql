import { User } from "models/userModel";
import { query } from "../config/database";


export const createUser = async(user : User) => {
    console.log(user);
    const { rows } = await query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,[user.name, user.email, user.password])
    return rows[0]
}

export const getUserByEmail = async (email: string) => {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  };

export const getUserById = async (id: number) => {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
  };

export const getUserByName = async (name: string) => {
    const { rows } = await query('SELECT * FROM users WHERE name = $1', [name]);
    return rows[0];
  };
  
export const updateUser = async (id: number, user: User) => {
    const { rows } = await query('UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING *', [user.name, user.email, user.password, id]);
    return rows[0];
  };

export const deleteUser = async (id: number) => {
    const { rows } = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return rows[0];
  };
  
