const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = require("../config/upload");
const { processCsvUpload, downloadLastCsv } = require("../Controller/CsvImportController");

// Middleware to handle multer errors specifically
const handleUploadErrors = (req, res, next) => {
  const uploadHandler = upload.single("file");

  uploadHandler(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.error('[MULTER_ERROR]', err);
      return res.status(400).json({ message: `File upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      console.error('[UNKNOWN_UPLOAD_ERROR]', err);
      return res.status(500).json({ message: `Unknown upload error: ${err.message}` });
    }
    // Everything went fine, proceed to the controller.
    next();
  });
};

// Route to handle CSV file upload and processing
router.post("/import-suspects-csv", handleUploadErrors, processCsvUpload);

// Route to download the last uploaded CSV file
router.get("/download-last-csv", downloadLastCsv);

module.exports = router;

