const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Hello, Worlds!");
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
