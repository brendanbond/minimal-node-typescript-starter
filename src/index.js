const path = require("path");
const dotenv = require("dotenv");
const express = require("express");

const globalCache = require("./redis");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

app.post("/webhook", (req, res) => {
  console.log("Received a POST request!");
  res.sendStatus(200);
});

const port = process.env.SERVER_PORT || 3000;

app.listen(port, "127.0.0.1", () => {
  console.log("HTTP Server running on port " + port);
});
