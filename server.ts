require("dotenv").config();
import { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { testDbConnection } from "./config/database";
import path from "path";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import projectRoutes from "./routes/projectRoutes";
import submissionRoutes from "./routes/submissionRoutes";
import commentRoutes from "./routes/commentRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import statsRoutes from "./routes/statsRoutes";
import { UserModel } from "./models/userModel";
import { SubmissionModel } from "./models/submissionModel";
import { ProjectModel } from "./models/projectModel";
import { CommentModel } from "./models/commentsModel";
import { ReviewModel } from "./models/reviewModel";
import { NotificationModel } from "./models/notificationModel";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { initializeWebSocket } from "./service/websocketService";

const express = require("express");
const app: Express = express();
const server = createServer(app);

// Initialize WebSocket
const io = initializeWebSocket(server);

app.use(express.json());
// serve static asset from public
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stats", statsRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

async function initializeDB() {
  await UserModel.createUserTable();
  await ProjectModel.createProjectTable();
  await SubmissionModel.createSubmissionTable();
  await CommentModel.createCommentTable();
  await ReviewModel.createReviewTable();
  await NotificationModel.createNotificationTable();
}

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  console.log(`WebSocket server initialized`);
});

testDbConnection();
initializeDB();

