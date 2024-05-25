const FileArchiveDB = require("../../config/models/file_archive");
const express = require("express");
const router = express.Router();
// @ts-ignore
// @ts-ignore
const multer = require("multer");
const path = require("path");
const fs = require('fs');
// @ts-ignore
// @ts-ignore
const { createCanvas, loadImage } = require('canvas');

const fileUpload = require("express-fileupload");

// Middleware for file uploads
router.use(fileUpload());

// Route for file upload
router.post("/save", async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  // @ts-ignore
  const uploadedFile = req.files.files;
  const filePath = req.body.folder;
  const userId = req.body.userId;

  try {
    const uploadPath = `upload/${filePath}/archive/${userId}`;

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Move the file to the desired location or process it as needed
    const fileExtension = path.extname(uploadedFile.name).toLowerCase();
    const originalFileName = uploadedFile.name;
    const originalFilePath = path.join(uploadPath, originalFileName);

  let fileExtensionFlag = false;
      const fileTypes = await FileArchiveDB.find();
      if (fileTypes.length > 0) {
        const fileTypesArray = fileTypes[0].filetype.split(',');

        if (fileTypesArray.includes(fileExtension.substring(1))) {
          fileExtensionFlag = true;
          console.log(fileExtensionFlag);
        } else {
          console.log(fileExtensionFlag);
        }
      } 

    if(fileExtensionFlag === true){

        if (fileExtension === '.png' || fileExtension === '.jpg' || fileExtension === '.jpeg' || fileExtension === '.gif') {
          // For image files: Save original and thumbnail
          // Move original file
          await uploadedFile.mv(originalFilePath);

          // Generate thumbnail
          const thumbnailFolderPath = path.join(uploadPath, 'thumbnail');
          if (!fs.existsSync(thumbnailFolderPath)) {
            fs.mkdirSync(thumbnailFolderPath, { recursive: true });
          }
          const thumbnailFileName = `${originalFileName}`;
          const thumbnailFilePath = path.join(thumbnailFolderPath, thumbnailFileName);
          
          // Create a copy of the original image as thumbnail
          fs.copyFileSync(originalFilePath, thumbnailFilePath);

          const response = {
            files: [
              {
                name: originalFileName,
                size: uploadedFile.size,
                type: uploadedFile.mimetype,
                url: `${process.env.BASE_URL}/${originalFilePath}`,
                thumbnailUrl: `${process.env.BASE_URL}/${thumbnailFilePath}`,
                deleteUrl: `${process.env.BASE_URL}/upload/deleteFile?userId=${userId}&file=${originalFileName}`,
                deleteType: "DELETE"
              }
            ]
          };

          res.json(response);
        } else {
          // For non-image files: Save outside thumbnail
          // Move the file
          await uploadedFile.mv(originalFilePath);

          const response = {
            files: [
              {
                name: originalFileName,
                size: uploadedFile.size,
                type: uploadedFile.mimetype,
                url: `${process.env.BASE_URL}/${originalFilePath}`,
                deleteUrl: `${process.env.BASE_URL}/upload/deleteFile?userId=${userId}&file=${originalFileName}`,
                deleteType: "DELETE"
              }
            ]
          };

          res.json(response);
        }
      }else{

        const response = {
          files: [
            {
              error: "Filetype not allowed",
              size: uploadedFile.size,
              type: uploadedFile.mimetype,
              name:originalFileName
            }
          ]
        };
        res.json(response);
       
      }

  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).send('Internal server error');
  }
});



router.post("/createFolder", (req, res) => {
  
  // console.log(req)
  // Access the uploaded file
  
  const folder = req.body.folder;
  const filePath = `./upload/users/archive/${folder}`;
  
  // @ts-ignore
  // @ts-ignore
  const userId = req.body.userId;
  console.log(filePath);
  // Move the file to the desired location or process it as needed

  fs.mkdir(filePath, { recursive: true }, (err) => {
      if (err) {
        res.send('Error creating folder:' + err);
      } else {
        const thumbnailFolder  = `./upload/users/archive/${folder}/thumbnail`;
        fs.mkdir(thumbnailFolder, { recursive: true }, (err) => {
          if (err) {
            res.send('Error creating folder:' + err);
          } else {
            res.send('Folder created successfully!');
          }
      });
       
      }
  });
});

router.post("/getFolderFiles", async (req, res) => {
  const folder = req.body.folder;
  const folderPath = `./upload/users/archive/${folder}`;
  const thumbnailPath = `./upload/users/archive/${folder}/thumbnail`;

  // Function to check if a file is an image
  function isImage(filename) {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }

  try {
    const fileData = await new Promise((resolve, reject) => {
      fs.readdir(folderPath, async (err, files) => {
        if (err) {
          reject(err);
          return;
        }

        // Filter out the thumbnail folder from the list of files
        const filteredFiles = files.filter(file => file !== 'thumbnail');

        const filePromises = filteredFiles.map(async file => {
          const filePath = path.join(folderPath, file);
          // @ts-ignore
          // @ts-ignore
          const thumbnailFilePath = path.join(thumbnailPath, file);

          try {
            const stats = await fs.promises.stat(filePath);

            let fileObject = {
              name: file,
              size: stats.size,
              deleteUrl: `${process.env.BASE_URL}/upload/deleteFile?userId=${folder}&file=${file}`,
              deleteType: "DELETE"
            };

            // Check if the file is an image
            if (isImage(file)) {
              fileObject.url = `${process.env.BASE_URL}/upload/users/archive/${folder}/files/${file}`;
              fileObject.thumbnailUrl = `${process.env.BASE_URL}/upload/users/archive/${folder}/thumbnail/${file}`;
              fileObject.type = "image/jpeg"; // You may adjust this depending on the file type
            } else {
              fileObject.url = `${process.env.BASE_URL}/upload/users/archive/${folder}/${file}`;
              // No thumbnail URL for non-image files
              fileObject.type = ""; // You may adjust this depending on the file type
            }

            return fileObject;
          } catch (error) {
            console.error('Error reading file stats:', error);
            throw error;
          }
        });

        try {
          const fileContents = await Promise.all(filePromises);
          resolve(fileContents);
        } catch (error) {
          reject(error);
        }
      });
    });

    res.json(fileData);
  } catch (error) {
    console.error('Error getting files from folder:', error);
    res.status(500).send('Internal server error');
  }
});

router.delete("/deleteFile", async (req, res) => {
  const userId = req.query.userId; // Assuming userId is passed in the request body
  const originalFileName = req.query.file;
  
  if (!userId || !originalFileName) {
    return res.status(400).json({ error: "User ID or file name not provided" });
  }

  // Function to check if a file is an image
  function isImage(filename) {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }

  const folderPath = `./upload/users/archive/${userId}`;
  const thumbnailPath = `./upload/users/archive/${userId}/thumbnail`;

  try {
    // Construct paths for the original file and its thumbnail
    // @ts-ignore
    const originalFilePath = path.join(folderPath, originalFileName);

    // Delete the original file
    await fs.promises.unlink(originalFilePath);

    // Check if the file is an image based on its extension
    const isImageFile = isImage(originalFileName);

    // If it's an image, attempt to delete the thumbnail
    if (isImageFile) {
      // @ts-ignore
      const thumbnailFilePath = path.join(thumbnailPath, originalFileName);

      try {
        // Check if the thumbnail exists before attempting to delete
        await fs.promises.access(thumbnailFilePath);
        // Delete the thumbnail if it exists
        await fs.promises.unlink(originalFilePath);
      } catch (err) {
        // If thumbnail doesn't exist, just log it
        console.log("Thumbnail doesn't exist for:", originalFileName);
      }
    }

    res.json({ status: "success", deletedFile: originalFileName });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).send('Internal server error' + error);
  }
});





// Route for file retrieval
router.get("/gallery/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "upload/users/archive", filename);

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send("File not found.");
    }
    // Stream the file back to the client
    res.sendFile(filePath);
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
