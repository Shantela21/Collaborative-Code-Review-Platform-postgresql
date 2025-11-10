import { query } from "../config/database";
import { User } from "../models/userModel";




export const updateUserDB = async (id: number, user: User) => {
    const { rows } = await query('UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING *', [user.name, user.email, user.password, id]);
    return rows[0];
  };

export const deleteUserDB = async (id: number) => {
    const { rows } = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return rows[0];
  };

  export const getAllUsersDB = async () => {
    const { rows } = await query('SELECT * FROM users');
    return rows;
  };


export const getUserByIdDB = async (id: number) => {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
  };
  