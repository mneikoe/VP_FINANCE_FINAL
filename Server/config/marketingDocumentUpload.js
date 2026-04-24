const multer = require("multer");
const path = require("path");
const fs = require("fs");

const targetDir = path.join(__dirname, "..", "public", "Documents", "marketing-docs");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, targetDir);
  },
  filename: function (_req, file, cb) {
    const safeOriginal = file.originalname.replace(/\s+/g, "_");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${safeOriginal}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB (supports videos too)
  },
});

module.exports = upload;
