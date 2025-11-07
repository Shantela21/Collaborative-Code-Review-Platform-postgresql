require('dotenv').config();
import { Express, Request,Response, NextFunction } from "express";
import { testDbConnection } from "./config/database";
import path from "path";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";


const express = require('express')
const app: Express = express()
app.use(express.json())
// serve static asset from public
app.use(express.static(path.join(__dirname, 'public')))


app.get('/', (req, res) => {
    req: Request
    res: Response
  res.sendFile(path.join(__dirname, 'views', 'index.html'))
})

app.use((req: Request, res: Response, next: NextFunction) => {
   res.status(404).json({
    success: false,
    message: "Route not found"
   });
});

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`)
})



testDbConnection();































// import express from "express";
// import dotenv from "dotenv";
// import { testDbConnection } from "../src/config/database";


// dotenv.config();

// const app = express();

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//     await testDbConnection();
// app.use(express.json());


// // testDbConnection();
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// })
// };

// startServer();