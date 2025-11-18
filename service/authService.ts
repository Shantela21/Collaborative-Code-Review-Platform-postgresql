import { User, UserWithoutPassword, UserModel } from "../models/userModel";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export const createUser = async (userData: { name: string; email: string; password: string }): Promise<UserWithoutPassword> => {
  const existingUser = await UserModel.findByEmail(userData.email);
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  const user = await UserModel.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: 'user'
  });

  return user;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return await UserModel.findByEmail(email);
};

export const generateToken = (user: UserWithoutPassword): string => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
