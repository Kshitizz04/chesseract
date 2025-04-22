import express from "express";
import {PORT} from "./config/env.ts";

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to Chesseract API!!");
});

app.listen(PORT, () => {
  console.log(`Chessert API is running on http://localhost:${PORT}`);
});

export default app
