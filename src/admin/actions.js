const express = require('express');
const router = express.Router();
const User = require('./Users');
const multer = require('multer'); 
const path = require('path');
const app = express();

const upload = multer();

router.post('/' ,upload.none(),async (req, res) => {
  
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

            case "deleteUserPhoto":
                await userInstance.delete_photo(res, req);
            break;

            case "deleteUserFile":
                await userInstance.delete_file(res, req);
            break;

            case "changeUserRole":
                await userInstance.changeUserRole(res, req);
            break;

            case "bannedUser":
                await userInstance.bannedUser(res, req);
            break;
    }
});

module.exports = router;
