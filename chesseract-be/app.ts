import express from "express";
import {PORT} from "./config/env.ts";
import userRouter from "./routes/user.routes.ts";
import gameRouter from "./routes/game.routes.ts";
import authRouter from "./routes/auth.routes.ts";
import connectToDatabase from "./database/mongodb.ts";

const app = express();

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/games', gameRouter);

app.get("/", (req, res) => {
  res.send("Welcome to Chesseract API!!");
});

app.listen(PORT, async () => {
  console.log(`Chesseract API is running on http://localhost:${PORT}`);
  await connectToDatabase();
});

export default app
