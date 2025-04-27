import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import {PORT} from "./config/env.ts";
import initializeSocketEvents from "./sockets/index.ts";

import userRouter from "./routes/user.routes.ts";
import gameRouter from "./routes/game.routes.ts";
import authRouter from "./routes/auth.routes.ts";
import connectToDatabase from "./database/mongodb.ts";
import errorMiddleware from "./middlewares/error.middleware.ts";
import arcjetMiddleware from "./middlewares/arcjet.middleware.ts";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(arcjetMiddleware); 
app.use(
  cors({
      origin: "http://localhost:3000", 
      credentials: true, 
  })
);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/games', gameRouter);

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Welcome to Chesseract API!!");
});

initializeSocketEvents(io);

server.listen(PORT, async () => {
  console.log(`Chesseract API is running on http://localhost:${PORT}`);
  await connectToDatabase();
});

export default app
