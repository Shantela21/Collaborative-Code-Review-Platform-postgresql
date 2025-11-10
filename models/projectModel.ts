import dotenv from 'dotenv';


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface projects{
    id: number;
    user_id: number;
    title: string;
    description: string;
    created_at: Date;
}