require('dotenv').config();
import { Express, Request,Response } from "express";


const express = require('express')
const app: Express = express()


app.get('/', (req, res) => {
    req: Request
    res: Response
  res.send('Welcome to the collaboration code review platform!')
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})
































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