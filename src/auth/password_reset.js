const express = require("express");
const router = express.Router();
const UserDB = require("../../config/models/users");
const crypto = require('crypto');
const Register = require("./Register");

router.get("/", async (req, res) => {
  // Extract the key from the URL query parameters
  const key = req.query.k;

  // @ts-ignore
  if(key === '' || key.length !== 32){
     return res.send('Invalid key');
  }else{

    const UserDetails = await UserDB.findOne({ reset_key:key });
     if(!UserDetails || UserDetails.reset_confirmed === 'Y'){
        return res.send('key expire');
     }

     const now = new Date();
    // @ts-ignore
    const expirationTime = new Date(UserDetails.reset_timestamp.getTime() + (process.env.PASSWORD_RESET_KEY_LIFE * 60000)); // Convert minutes to milliseconds
   if(now > expirationTime){
        res.send("key expire");
   };
  }
  



  // Render the HTML page with an input box pre-filled with the key
  res.send(`
        <html>
        <style>
        .bg-black {
            background-color: white;
        }

        .header {
            text-align: center;
            font-size: 24px;
            margin-bottom: 20px;
            color: #000; /* Adjust font color */
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            color: black; /* Adjust font color */
        }

        input[type="password"] {
            padding: 10px;
            border: 1px solid #777;
            border-radius: 5px;
            width: 100%;
        }

        .btn {
            padding: 10px;
            border: none;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            background-color: #008000; /* Adjust button background color */
            color: #FFF; /* Adjust button text color */
        }

        .text-error {
            color: red;
            text-align: center;
            margin-top: 20px;
        }

        #password-reset-form {
            text-align: center;
        }

        .bg-gray {
            background-color: #7955480f; /* Adjust background color */
            padding: 20px;
            border-radius: 10px;
            width: 300px; /* Adjust form width */
            margin: 0 auto;
        }
    </style>
        <body class="bg-black">
            <div class="form-box">
                <div id="password-reset-modal">  
                    <div class="header">Your Website Name</div>
                    <div class="body bg-gray">    
                        <div id="password-reset-form">
                            <form action="" method="POST">
                        
                                <div class="form-group">
                                    <label for="new_password">New Password</label>
                                    <input type="password" id="new_password" name="new_password" required/>
                                </div>
                                
                                <input type="hidden" value="${key}" name="reset_key">
                                <button type="submit" class="btn bg-olive btn-block">Reset Password</button>
                            </form>
                            <p><small style="color:red">Password requires: 1 uppercase, 1 lowercase, 1 special character, 1 number, minimum 8 characters</small></p>
                        </div>
                    </div>
                </div>
            </div>  
        </body>
        </html>
    `);
});

router.post("/", async (req, res) => {
  
    const newPassword = req.body.new_password || "";
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

     if (!passwordRegex.test(newPassword)) {
        res.send('Please enter atleast 8 charcter with number symbol and capital and small letter.');
       return false;
     }
    const reset_key = req.body.reset_key || "";

    const hashedPassword = crypto.createHash('sha512').update(newPassword).digest('hex')

    const password = await Register.hashPassword(hashedPassword)

    const updatedUser = await UserDB.findOneAndUpdate(
        { reset_key: reset_key },
        {
            password :password, 
            reset_confirmed : 'Y',
            reset_key : ''
        },
        { new: true }
      );
    // Send a response to the user
    if(updatedUser){
        res.send('Password reset successfully');
    }else{
        res.send('Error while password reset or expired key')
    }
   
  });

module.exports = router;
