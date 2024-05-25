const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require('fs');

const fileUpload = require("express-fileupload");

// Middleware for file uploads
router.use(fileUpload());



// Function to filter only PDF files



// Route for file upload
router.post("/gallery", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  // Access the uploaded file
  // @ts-ignore
  const uploadedFile = req.files.files;

  // Move the file to the desired location or process it as needed
  uploadedFile.mv("upload/users/archive/" + uploadedFile.name, (err) => {
    if (err) {
      return res.status(500).send(err);
    }

 
    res.send("File uploaded!");
  });
});

// Route for file deletion (revert)
router.delete("/gallery/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "upload/users/archive", filename);

  // Delete the file
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send("File reverted!");
  });
});

module.exports = router;
