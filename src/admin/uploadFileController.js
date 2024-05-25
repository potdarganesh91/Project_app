const express = require("express");
const router = express.Router();
const User = require("./Users");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require('fs');

const fileUpload = require("express-fileupload");

// Middleware for file uploads
// router.use(fileUpload());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/users/images/"); // Specify the destination folder
  },
  filename: function (req, file, cb) {
    console.log(req.body);
    // Generate a unique name for the file
    const ext = path.extname(file.originalname);
    cb(null, req.body.user_id + ext);
  },
});

// Function to filter only JPEG images
function fileFilter(req, file, cb) {
  // Check file extension to ensure it's a JPEG image with .jpg extension
  const allowedExtensions = [".jpg"];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true); // Accept the file
  } else {
    // Reject the file with an error message
    cb("Only JPG images are allowed!", false);
  }
}

// Configure multer for handling file uploads

// const upload = multer({ storage: storage });
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 },
});

router.post("/photo", async (req, res) => {
  upload.single("photo")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(200).send({ status: "error", msg: err.message });
    } else if (err) {
      return res.status(200).send({ status: "error", msg: err });
    } else {
      if (req.file) {
        // Check if req.file exists
        sharp(req.file.path)
          .resize(90, 90)
          .toFile(
            "upload/users/images/thumbnail/" + req.file.filename,
            (resizeErr) => {
              if (resizeErr) {
                return res
                  .status(200)
                  .send({ status: "error", msg: "Failed to resize image" });
              } else {
                return res
                  .status(200)
                  .send({
                    status: "success",
                    msg: "Photo uploaded successfully",
                  });
              }
            }
          );
      } else {
        return res
          .status(200)
          .send({ status: "error", msg: "No file uploaded" });
      }
    }
  });
});

// Function to filter only PDF files

const pdfStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/users/pdf/"); // Specify the destination folder
  },
  filename: function (req, file, cb) {
    console.log(req.body);
    // Generate a unique name for the file
    const ext = path.extname(file.originalname);
    cb(null, req.body.user_id + ext);
  },
});

function pdfFileFilter(req, file, cb) {
  const allowedExtensions = [".pdf"];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true); // Accept the file
  } else {
    cb("Only PDF files are allowed!", false); // Reject the file with an error message
  }
}

const pdfUpload = multer({
  storage: pdfStorage,
  fileFilter: pdfFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("file");

router.post("/file", async (req, res) => {
  pdfUpload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).send({ status: "error", msg: err.message });
    } else if (err) {
      return res.status(400).send({ status: "error", msg: err });
    } else {
      if (req.file) {
        return res
          .status(200)
          .send({ status: "success", msg: "PDF uploaded successfully" });
      } else {
        return res
          .status(400)
          .send({ status: "error", msg: "No PDF uploaded" });
      }
    }
  });
});

// Route for file upload
// router.post("/gallery", (req, res) => {
//   if (!req.files || Object.keys(req.files).length === 0) {
//     return res.status(400).send("No files were uploaded.");
//   }

//   // Access the uploaded file
//   // @ts-ignore
//   const uploadedFile = req.files.files;

//   // Move the file to the desired location or process it as needed
//   uploadedFile.mv("upload/users/archive/" + uploadedFile.name, (err) => {
//     if (err) {
//       return res.status(500).send(err);
//     }

 
//     res.send("File uploaded!");
//   });
// });

module.exports = router;
