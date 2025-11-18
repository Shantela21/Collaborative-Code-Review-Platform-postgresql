import { User, UserWithoutPassword, UserModel } from "../models/userModel";
import bcrypt from 'bcryptjs';

export const updateUserDB = async (id: number, updates: { name?: string; email?: string; password?: string }): Promise<UserWithoutPassword | null> => {
  const updateData: any = {};
  
  if (updates.name) updateData.name = updates.name;
  if (updates.email) updateData.email = updates.email;
  if (updates.password) {
    updateData.password = await bcrypt.hash(updates.password, 10);
  }

  if (Object.keys(updateData).length === 0) {
    return await UserModel.findById(id);
  }

  return await UserModel.update(id, updateData);
};

export const deleteUserDB = async (id: number): Promise<boolean> => {
  return await UserModel.delete(id);
};

export const getAllUsersDB = async (limit = 50, offset = 0): Promise<UserWithoutPassword[]> => {
  return await UserModel.getAll(limit, offset);
};

export const getUserByIdDB = async (id: number): Promise<UserWithoutPassword | null> => {
  return await UserModel.findById(id);
};