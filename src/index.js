import path from "path";
import dotenv from "dotenv";
import express from "express";

import globalCache from "./redis";

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

const port = process.env.SERVER_PORT || 3000;

app.listen(port, "127.0.0.1", () => {
  console.log("HTTP Server running on port " + port);
});
