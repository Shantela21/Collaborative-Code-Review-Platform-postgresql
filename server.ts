require('dotenv').config();
import { Express, Request,Response, NextFunction } from "express";
import { testDbConnection } from "./config/database";
import path from "path";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import projectRoutes from "routes/projectRoutes";


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


app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)


app.use((req: Request, res: Response, next: NextFunction) => {
   res.status(404).json({
    success: false,
    message: "Route not found"
   });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`)
})



testDbConnection();




