"use strict";

const express = require("express");
const path = require("path");

const app = express();

// ✅ Port mặc định nên là 3000 (không dùng 80 trực tiếp để tránh lỗi quyền)
const PORT = Number(process.env.PORT || 3000);

// ✅ Bind tất cả network interfaces để truy cập được qua Public DNS / IP
const HOST = process.env.HOST || "0.0.0.0";

// Thư mục static
const PUBLIC_DIR = path.join(__dirname, "public");

// Middleware: serve static
app.use(express.static(PUBLIC_DIR));

// Health check (dùng để test nhanh / ALB / monitoring)
app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "pf-node",
    ts: Date.now(),
  });
});

// Route "/" trả về index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// Optional: 404 fallback (nếu bạn không muốn hiện lỗi khó hiểu)
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`[pf-node] Listening on http://${HOST}:${PORT}`);
  console.log(`[pf-node] Public folder: ${PUBLIC_DIR}`);
});

// Graceful shutdown (PM2/EC2 reboot)
process.on("SIGINT", () => {
  console.log("[pf-node] SIGINT received, shutting down...");
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  console.log("[pf-node] SIGTERM received, shutting down...");
  server.close(() => process.exit(0));
});
