import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dns from "node:dns";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import path from "path";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 5002;

//common middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

//importing routes
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

//routers
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

//error handling middleware
app.use(errorHandler);

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  connectDB();
});
