const UserDB = require("../../config/models/users");
const UserInfoDB = require("../../config/models/user_info");
const express = require('express');
const multer = require("multer");
const path = require("path");
const app = express();
const cors = require('cors'); // Import the cors middleware
app.use(cors());
const crypto = require('crypto');

const Validator = require('./Validations');
const Email = require('./mail');
const EmailInstance = new Email();

class Register {
  // No need for the constructor in this case

  // validations --------------------
  static async validateUser(user) {
    const errors = [];  
    if (await Validator.isVariableEmpty(user.email)) {
      errors.push({ msg: 'Email is required' });
    }

    if (await Validator.isEmailExist(user.email)) {
      errors.push({ msg: 'Email is already registered' });
    }
    
    if (!(await Validator.emailValidation(user.email))) {
      errors.push({ msg: 'Invalid email format' });
    }

    return errors;
  }
  // validations --------------------

  // password hash --------------------
static async hashPassword(password) {
  const salt = "$2a$" + process.env.PASSWORD_BCRYPT_COST + "$" + process.env.PASSWORD_SALT;
  let newPassword = password;

  // Hash the password using SHA512
  for (let i = 0; i < 10000; i++) {
      newPassword = crypto.createHash('sha512').update(salt + newPassword + salt).digest('hex');
  }

  return newPassword; // Return hashed password
}
// password hash --------------------



  async register(res, req) {
    try {
        const errors = await Register.validateUser(req.body);

        

        if (errors.length === 0) {

            const key = Register.createKey();

            // const mail_sent =await EmailInstance.confirmationEmail(req.body.email, key)
            const mail_sent ='success';
            if (mail_sent === 'success') {
                 // Create new user
                 const hashPassword = await Register.hashPassword(req.body.password);

                const newUser = new UserDB({
                    email: req.body.email,
                    username: req.body.email, // Replace with username logic if needed
                    user_role: 1, // Replace with appropriate user role value
                    email_verify: 'N',
                    confirmation_key: key,
                    password:hashPassword,
                    register_date: new Date().toISOString(),
                    phone_verify: 'N'
                });

                const addedUser = await newUser.save();

                const lastInsertID = addedUser.user_id;
                const newUserInfo = new UserInfoDB({
                    user_id: lastInsertID,
                });
                
                await newUserInfo.save()
                const result = {
					status: "success",
					msg   : 'register_successfully'
                };
                res.json(result);
                await EmailInstance.welcomeEmail(req.body.email)
            }else{
                let errors = {msg : "Network error"};
                const result = {
					status: "failed",
					msg   : errors
                };
                res.json(result);
            }
                  
        }else{
            const result = {
                status: "error",
                msg: "error",
                errors: errors
              };
              res.json(result);
        }
             
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

//  create key -------- 
static createKey() {
    const currentTime = new Date().getTime().toString();
    const salt = process.env.PASSWORD_SALT || '';
    const key = crypto.createHash('md5')
      .update(currentTime + salt + currentTime)
      .digest('hex');
    
    return key;
  }
// create key -------- 


 
}

module.exports = Register;
