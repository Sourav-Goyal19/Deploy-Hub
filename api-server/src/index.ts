import express, { Errback, NextFunction, Request, Response } from "express";

import cors from "cors";
import cookieParser from "cookie-parser";

import AuthRouter from "./routes/auth";
import ProjectRouter from "./routes/project";

import { Server } from "socket.io";
import { redis } from "./libs/redis";
import { authMiddleware } from "./middlewares/auth";

const PORT = process.env.PORT || 9000;
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use((err: Errback, req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", "true");
});
app.use(express.json());
app.use(cookieParser());

const io = new Server({ cors: { origin: "*" } });

io.listen(9001);

io.on("connection", (socket) => {
  socket.on("subscribe", (room) => {
    socket.join(room);
    socket.emit("message", `Socket Subcribed to ${room}`);
  });
});

app.use("/api/auth", AuthRouter);
app.use("/api/project", ProjectRouter);

app.get("/api/user", authMiddleware, (req, res) => {
  // @ts-ignore
  res.status(200).json({ user: req.user, message: "User got successfully" });
});

async function subscribeToRedis() {
  redis.psubscribe("logs-*");
  redis.on("pmessage", (pattern, room, message) => {
    io.to(room).emit("message", message);
  });
}

subscribeToRedis();

app.listen(PORT, () => console.log(`Api server started at ${PORT}`));
