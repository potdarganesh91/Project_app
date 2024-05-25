const express = require('express');
const router = express.Router();
const User = require('./Users');
const multer = require('multer'); 
const path = require('path');

multer.array()

// Function to filter only JPEG images
function fileFilter(req, file, cb) {
    // Check file mimetype to ensure it's a JPEG image
    if (file.mimetype === 'image/jpeg') {
        cb(null, true); // Accept the file
    } else {
        // Reject the file with an error message
        cb(new Error('Only JPEG images are allowed!'));
    }
}
// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'upload/users/images/thumbnail/'); // Specify the destination folder
    },
    filename: function (req, file, cb) {
        console.log(req.body)
        // Generate a unique name for the file
        const ext = path.extname(file.originalname);
        cb(null, req.body.user_id +ext);
    }
});



// Initialize multer with the storage configuration
// const upload = multer({ storage: storage });
const upload = multer({ storage: storage, fileFilter: fileFilter  });

router.post('/' ,async (req, res) => {
    upload.single('photo')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading
            return res.status(400).send('Multer error: ' + err.message);
        } else if (err) {
            // An unknown error occurred
            return res.status(500).send('Error: ' + err.message);
        }

        // File has been uploaded and can be accessed via req.file
        res.send('File uploaded successfully');
    });


    const action = req.body.action;
    const userInstance = new User();
    switch (action) {
        case 'getAllUserData':
            
            await userInstance.getAllUsers(res);
            break;

            case 'addUserData':
            await userInstance.addUserData(res,req);  
            break;
    
            case "getUserDeatils":
            await userInstance.getUserDetails(res,req);
            break;
                
            case "updateUserData":
            await userInstance.updateUserData(res,req);
            break;

            case "deleteUserData":
            await userInstance.deleteUserData(res,req);
            break;

            case "addUserPhoto":
            await userInstance.upload_photo(res,req);
            break;
    }
});

module.exports = router;
