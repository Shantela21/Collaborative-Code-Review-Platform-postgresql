import { Request, Response } from 'express';
import { createUser, getUserByEmail, getUserByName as findUserByName} from '../service/authService';
import bcrypt from 'bcryptjs';



export const createNewUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, password:hashedPassword });
    console.log(user);
    res.status(201).json(user);
  }
  catch (error) {
    res.status(404).json(error)
  }

};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    res.status(200).json(user);
    
  } catch (error) {
    res.status(404).json(error)
  }
};



