const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 80;

// Serve static file trong thư mục public
app.use(express.static(path.join(__dirname, "public")));

// Route "/" trả về index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Plane Fighting web is running at http://localhost:${PORT}`);
});
