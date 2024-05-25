const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const app = express();
const Register = require('./Register');
const Login = require('./login');
// @ts-ignore
const upload = multer();
router.post('/', upload.none(), async (req, res) => {
    
    const action = req.body.action;
    const RegisterInstance = new Register();
    const LoginInstance = new Login();
    switch (action) {
        case 'register':
        await RegisterInstance.register(res,req);   
        break;

        case 'phoneLogin':
        await LoginInstance.joinWithPhone(res,req);   
        break;

        case 'login_check':
        await LoginInstance.userLogin(res,req);   
        break;

        case 'sendLoginOTPEmail':
        await LoginInstance.send_login_otp_email(res,req);   
        break;

        case 'verifyLoginOTPEmail':
        await LoginInstance.verify_login_otp_email(res,req);   
        break;

        case 'joinWithEmail':
        await LoginInstance.joinWithEmail(res,req);   
        break;

        case 'LogOutUser':
        await LoginInstance.logout(res,req);   
        break;

        case 'forgot_Password':
        await LoginInstance.forgot_Password(res,req);   
        break;

        case 'changePassword':
        await LoginInstance.change_password(res,req);   
        break;

        case 'checkUserData':
        await LoginInstance.getUserDetails(res,req); 
        break;

        case 'getUserProfileData':
        await LoginInstance.getUserDetails(res,req); 
        break;

        case 'updateUserProfileData':
        await LoginInstance.updateUserProfileData(res,req); 
        break;

        case 'verifyPhone':
        await LoginInstance.verify_phone(res,req); 
        break;

        case 'sendOTPEmail':
        await LoginInstance.send_otp_email(res,req); 
        break;

        case 'verifyOTPEmail':
        await LoginInstance.verify_otp_email(res,req); 
        break;


    }
});



module.exports = router;
