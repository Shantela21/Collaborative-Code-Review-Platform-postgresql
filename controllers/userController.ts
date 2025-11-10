require('dotenv').config();
import { Request, Response } from 'express';
import { deleteUserDB, getAllUsersDB, getUserByIdDB, updateUserDB } from '../service/userService';

export const getAllUsers = async (req: Request, res: Response) => {
    const users = await getAllUsersDB();
    res.status(200).json(users);
  };
  
export const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await getUserByIdDB(parseInt(id));
    res.status(200).json(user);
  };

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  try {
    const user = await updateUserDB(parseInt(id), { name, email, password });
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json(error);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await deleteUserDB(parseInt(id));
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json(error)
  }
};