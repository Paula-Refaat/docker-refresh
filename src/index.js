const express = require("express");
const mongoose = require("");

// init app
const PORT = Process.env.PORT || 4000;
const app = express();

// connect db
const DB_USER = "root";
const DB_PASSWORD = "example";
const DB_PORT = 27017;
const DB_Host = 'mongo';


const URI = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_Host}:${DB_PORT}`;
mongoose
  .connect(URI)
  .then(() => {
    console.log("connect to db ....");
  })
  .catch((err) => console.log("failed to connect to db  ", err));
app.get("/", (req, res) => {
  res.send("Hello, Worlds!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
