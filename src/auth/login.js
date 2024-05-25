const UserDB = require("../../config/models/users");
const UserInfoDB = require("../../config/models/user_info");
const SocailLoginDB = require("../../config/models/social_logins");
const LoginAttemptDB = require("../../config/models/login_attempts_history");
const userRoleDB = require("../../config/models/user_roles");
const express = require("express");
const crypto = require("crypto");
// @ts-ignore
// @ts-ignore
const multer = require("multer");
// @ts-ignore
// @ts-ignore
const path = require("path");
const app = express();
const cors = require("cors"); // Import the cors middleware
app.use(cors());
const Validator = require("./Validations");
const Email = require("./mail");
const Register = require("./Register");
const EmailInstance = new Email();

class Login {
  // validations --------------------
  static async validateUser(user) {
    const errors = [];
    if (await Validator.isVariableEmpty(user.username)) {
      errors.push({ msg: "Email is required" });
    }

    if (await Validator.isEmailExist(user.username)) {
      errors.push({ msg: "Email is already registered" });
    }

    if (await Validator.isPhoneExist(user.username)) {
      errors.push({ msg: "Phone is already registered" });
    }

    return errors;
  }
  // validations --------------------

  // password hash --------------------
  static async hashPassword(password) {
    const salt =
      "$2a$" +
      process.env.PASSWORD_BCRYPT_COST +
      "$" +
      process.env.PASSWORD_SALT;
    let newPassword = password;

    // Hash the password using SHA512
    for (let i = 0; i < 10000; i++) {
      newPassword = crypto
        .createHash("sha512")
        .update(salt + newPassword + salt)
        .digest("hex");
    }

    return newPassword; // Return hashed password
  }
  // password hash --------------------

  // add login attempt ----------------

  // @ts-ignore
  // @ts-ignore
  static async addLoginAttempt(res, req) {
    const date = new Date().toISOString(); // Get current date in YYYY-MM-DD format
    const userIp = req.connection.remoteAddress; // Get user IP address

    // Get current number of attempts from this IP address
    const existingAttempt = await LoginAttemptDB.findOne({
      user_ip_address: userIp,
      date: date,
    });

    if (existingAttempt) {
      // Update existing attempt
      await LoginAttemptDB.findByIdAndUpdate(existingAttempt._id, {
        $inc: { no_of_attempt: 1 },
      });
    } else {
      // Create new attempt
      const newAttempt = new LoginAttemptDB({
        user_ip_address: userIp,
        date: date,
        no_of_attempt: 1,
      });
      await newAttempt.save();
    }
  }
  // add login attempt ----------------

  // is_log_in ------------------------
  static async is_log_in(res, req, user_id) {
    if (!user_id) {
      return false;
    }

    const userData = await UserDB.findOne({ user_id });

    if (userData.banned === "Y") {
      const result = {
        status: "error",
        message: "User banned!. please contact with admin",
      };
      res.json(result);
      return false;
    }

    // for update data and status ---------------------

    const updatedUser = await UserDB.findOneAndUpdate(
      { user_id: user_id },
      {
        last_login: new Date().toLocaleString(),
        status: "ON",
      },
      { new: true }
    );
    // for update data and status ---------------------

    await Login.addLoginAttempt(res, req);

    let role_id = updatedUser.user_role;
    const userRole = await userRoleDB.findOne({ role_id });

    const result = {
      status: "success",
      key: user_id,
      user_role: userRole.role,
    };
    res.json(result);
  }

  // is_log_in ------------------------

  async joinWithPhone(res, req) {
    try {
      const errors = await Login.validateUser(req.body);

      if (errors.length === 0) {
        const newUser = new UserDB({
          username: req.body.username, // Replace with username logic if needed
          user_role: 1, // Replace with appropriate user role value
          phone: req.body.username,
          country_code: req.body.county_code,
          email_verify: "N",
          register_date: new Date().toISOString(),
          last_login: new Date().toISOString(),
          phone_verify: "Y",
          status: "ON",
        });

        const addedUser = await newUser.save();

        const lastInsertID = addedUser.user_id;

        const newUserInfo = new UserInfoDB({
          user_id: lastInsertID,
        });
        await newUserInfo.save();

        const JoinwithSocail = new SocailLoginDB({
          user_id: lastInsertID,
          provider: req.body.provider,
          providerId: req.body.providerId,
        });
        await JoinwithSocail.save();
      } else {
        if (req.body.username !== "") {
          let username = req.body.username;
          const UserDetails = await UserDB.findOne({ phone: username });

          if (UserDetails) {
            if (UserDetails.banned === "Y") {
              const result = {
                status: "error",
                msg: "User banned!. please contact with admin",
              };
              res.json(result);
              return false;
            }

            await Login.is_log_in(res, req, UserDetails.user_id);
          } else {
            const result = {
              status: "error",
              msg: "user not found",
            };
            res.json(result);
            return false;
          }
        }
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async joinWithEmail(res, req) {
    try {
      const errors = await Login.validateUser(req.body);

      if (errors.length === 0) {
        const newUser = new UserDB({
          username: req.body.username, // Replace with username logic if needed
          user_role: 1, // Replace with appropriate user role value
          email: req.body.username,
          email_verify: "Y",
          register_date: new Date().toISOString(),
          last_login: new Date().toISOString(),
          phone_verify: "N",
          status: "ON",
        });

        const addedUser = await newUser.save();

        const lastInsertID = addedUser.user_id;

        const newUserInfo = new UserInfoDB({
          user_id: lastInsertID,
        });
        await newUserInfo.save();

        const JoinwithSocail = new SocailLoginDB({
          user_id: lastInsertID,
          provider: req.body.provider,
          providerId: req.body.providerId,
        });
        await JoinwithSocail.save();

        await Login.is_log_in(res, req, addedUser.user_id);
      } else {
        if (req.body.username !== "") {
          let username = req.body.username;
          const UserDetails = await UserDB.findOne({ email: username });

          if (UserDetails) {
            if (UserDetails.banned === "Y") {
              const result = {
                status: "error",
                msg: "User banned!. please contact with admin",
              };
              res.json(result);
              return false;
            }

            await Login.is_log_in(res, req, UserDetails.user_id);
          } else {
            const result = {
              status: "error",
              msg: "user not found",
            };
            res.json(result);
            return false;
          }
        }
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  async userLogin(res, req) {
    try {
      const errors = [];
      if (await Validator.isVariableEmpty(req.body.username)) {
        errors.push("Username is required");
      }

      if (await Validator.isVariableEmpty(req.body.password)) {
        errors.push("Password is required");
      }

      if (errors.length !== 0) {
        const errorMessage = errors.join("<br />");
        const result = {
          status: "error",
          message: errorMessage,
        };
        res.json(result);
      }
      const hashPassword = await Login.hashPassword(req.body.password);

      const existingUser = await UserDB.findOne({
        $and: [
          { $or: [{ email: req.body.username }, { phone: req.body.username }] },
          { password: hashPassword }, // Condition 2: Password
        ],
      });

      if (existingUser) {
        if (existingUser.email_verify === "N") {
          const result = {
            status: "error",
            message: "User haven't verified their email",
          };
          res.json(result);
          return false;
        } else {
          await Login.is_log_in(res, req, existingUser.user_id);
        }
      } else {
        const result = {
          status: "error",
          message: "Invalid username or password. Please try again.",
        };
        res.json(result);
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async send_login_otp_email(res, req) {
    try {
      const email = req.body.verify_email;

      const user = await UserDB.findOne({ email });

      if (!user) {
        // Email not registered
        const result = {
          status: "error",
          msg: "Email is not registered. Please register to continue",
        };
        res.json(result);
      } else {
        const mail_sent = await EmailInstance.sendOTPEmail(email);

        if (mail_sent.status === "success") {
          // @ts-ignore
          const updatedUserOTP = await UserDB.findOneAndUpdate(
            { user_id: user.user_id },
            {
              otp_confirmation_key: mail_sent.otp,
            },
            { new: true } // Return the updated document
          );
          const result = {
            status: "success",
            msg: "Sent OTP Successfully",
          };
          res.json(result);
        } else {
          const result = {
            status: "error",
            msg: "email not send due to network error",
          };
          res.json(result);
        }
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  async verify_login_otp_email(res, req) {
    try {
      const email = req.body.verify_email;
      // @ts-ignore
      const verify_email_otp = req.body.verify_email_otp;

      const user = await UserDB.findOne({ email });

      if (user) {
        if (
          user.otp_confirmation_key == "" ||
          user.otp_confirmation_key == null
        ) {
          const result = { status: "otp_expired", msg: "OTP expired" };
          res.json(result);
        }

        if (user.otp_confirmation_key === verify_email_otp) {
          const updatedUser = await UserDB.findOneAndUpdate(
            { user_id: user.user_id },
            {
              otp_confirmation_key: "",
              email: email,
              email_verify: "Y",
              confirmed: "Y",
            },
            { new: true }
          );

          if (updatedUser) {
            const result = {
              status: "success",
              msg: "Email verified successfully",
            };
            res.json(result);
          }
        } else {
          const result = {
            status: "error",
            msg: "Please enter a valid OTP",
          };
          res.json(result);
        }
      } else {
        // Email not registered
        const result = {
          status: "error",
          msg: "Email is not registered. Please register to continue",
        };
        res.json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  async logout(res, req) {
    try {
      const user_id = req.body.user_id;

      const user = await UserDB.findOne({ user_id });

      if (user) {
        const updatedUser = await UserDB.findOneAndUpdate(
          { user_id: user.user_id },
          {
            status: "OFF",
          },
          { new: true }
        );

        if (updatedUser) {
          const result = {
            status: "success",
          };
          res.json(result);
        }
      } else {
        // Email not registered
        const result = {
          status: "error",
          msg: "User is not registered.",
        };
        res.json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  async forgot_Password(res, req) {
    try {
      if (req.body.email !== "") {
        if (await Validator.isVariableEmpty(req.body.email)) {
          const result = {
            status: "error",
            msg: "Email is required",
          };
          res.json(result);
          return false;
        }

        if (await Validator.emailValidation(req.body.email)) {
          const result = {
            status: "error",
            msg: "Invalid email format",
          };
          res.json(result);
          return false;
        }

        if ((await Validator.isEmailExist(req.body.email)) === false) {
          const result = {
            status: "error",
            msg: "Email is not registered",
          };
          res.json(result);
          return false;
        }
      }
      const key = Register.createKey();
      const mail_sent = await EmailInstance.passwordResetEmail(
        req.body.email,
        key
      );

      if (mail_sent.status === "success") {
        const updatedUser = await UserDB.findOneAndUpdate(
          { email: req.body.email },
          {
            reset_key: key,
            reset_confirmed: "N",
            reset_timestamp: new Date().toLocaleString(),
          },
          { new: true } // Return the updated document
        );
        if (updatedUser) {
          const result = {
            status: "success",
            msg: "Please check your email for the reset password link.",
          };
          res.json(result);
        }
      } else {
        const result = {
          status: "error",
          msg: "Email not sent due to  network error",
        };
        res.json(result);
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async change_password(res, req) {
    try {
      let current_password = req.body.current_password;

      if (current_password !== "") {
        const updatedUser = await UserDB.findOne({ user_id: req.body.user_id });
        if (updatedUser) {
          const current_password = await Register.hashPassword(
            req.body.current_password
          );
          const new_password = await Register.hashPassword(
            req.body.new_password
          );

          if (current_password === updatedUser.password) {
            const updatedUser = await UserDB.findOneAndUpdate(
              { user_id: req.body.user_id },
              {
                password: new_password,
              },
              { new: true } // Return the updated document
            );

            if (updatedUser) {
              const result = {
                status: "success",
                msg: "Password change Successfully.",
              };
              res.json(result);
            }
          } else {
            const result = {
              status: "success",
              msg: "Current password is not valid.",
            };
            res.json(result);
          }
        }
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  getUserDetails = async (res, req) => {
    let userID = parseInt(req.body.user_id);
    const userDetails = await UserDB.aggregate([
      {
        $match: {
          user_id: userID,
        },
      },
      {
        $lookup: {
          from: "user_info",
          localField: "user_id",
          foreignField: "user_id",
          as: "userInfo",
        },
      },
      {
        $lookup: {
          from: "user_roles",
          localField: "user_role",
          foreignField: "role_id",
          as: "user_roles",
        },
      },
      {
        $project: {
          _id: 0,
          user_id: 1,
          username: 1,
          email: 1,
          phone: 1,
          password: 1,
          country_code: 1,
          confirmation_key: 1,
          confirmed: 1,
          phone_verify: 1,
          email_verify: 1,
          reset_key: 1,
          reset_confirmed: 1,
          otp_confirmation_key: 1,
          banned: 1,
          register_date: 1,
          membership_code: 1,
          status: 1,
          reset_timestamp: 1,
          last_login: 1,
          user_role: { $arrayElemAt: ["$user_roles.role", 0] },
          first_name: { $arrayElemAt: ["$userInfo.first_name", 0] },
          last_name: { $arrayElemAt: ["$userInfo.last_name", 0] },
          middle_name: { $arrayElemAt: ["$userInfo.middle_name", 0] },
          birth_date: { $arrayElemAt: ["$userInfo.birth_date", 0] },
          department: { $arrayElemAt: ["$userInfo.department", 0] },
          position: { $arrayElemAt: ["$userInfo.position", 0] },
          qualification: { $arrayElemAt: ["$userInfo.qualification", 0] },
          joining_date: { $arrayElemAt: ["$userInfo.joining_date", 0] },
          address: { $arrayElemAt: ["$userInfo.address", 0] },
        },
      },
    ]);
    if (userDetails.length === 0) {
      const result = {
        status: "error",
        msg: "user not found",
      };
      res.json(result);
    } else {
      const result = {
        status: "success",
        userDetails: userDetails[0],
      };
      res.json(result);
    }
  };

  getUserInfo = async (res, req) => {
    let userID = parseInt(req.body.user_id);
    const userDetails = await UserDB.aggregate([
      {
        $match: {
          user_id: userID,
        },
      },
      {
        $lookup: {
          from: "user_info",
          localField: "user_id",
          foreignField: "user_id",
          as: "userInfo",
        },
      },
      {
        $lookup: {
          from: "user_roles",
          localField: "user_role",
          foreignField: "role_id",
          as: "user_roles",
        },
      },
      {
        $project: {
          _id: 0,
          user_id: 1,
          username: 1,
          email: 1,
          phone: 1,
          password: 1,
          country_code: 1,
          confirmation_key: 1,
          confirmed: 1,
          phone_verify: 1,
          email_verify: 1,
          reset_key: 1,
          reset_confirmed: 1,
          otp_confirmation_key: 1,
          banned: 1,
          register_date: 1,
          membership_code: 1,
          status: 1,
          reset_timestamp: 1,
          last_login: 1,
          user_role: { $arrayElemAt: ["$user_roles.role", 0] },
          first_name: { $arrayElemAt: ["$userInfo.first_name", 0] },
          last_name: { $arrayElemAt: ["$userInfo.last_name", 0] },
          middle_name: { $arrayElemAt: ["$userInfo.middle_name", 0] },
          birth_date: { $arrayElemAt: ["$userInfo.birth_date", 0] },
          department: { $arrayElemAt: ["$userInfo.department", 0] },
          position: { $arrayElemAt: ["$userInfo.position", 0] },
          qualification: { $arrayElemAt: ["$userInfo.qualification", 0] },
          joining_date: { $arrayElemAt: ["$userInfo.joining_date", 0] },
          address: { $arrayElemAt: ["$userInfo.address", 0] },
        },
      },
    ]);
    if (userDetails.length === 0) {
      return "user not fount";
    } else {
      return userDetails[0];
    }
  };

  updateUserProfileData = async (res, req) => {
    let current_info = await this.getUserInfo(res, req);
    let resData = req.body

    if (current_info.length === 0) {
      const result = {
        status: "error",
        msg: "user not found",
      };
      res.json(result);
    } else {
          var phone_verify = 'N';
          let email_verify = 'N';
          let phone = current_info.phone;
          let email = current_info.email;
          if (current_info.phone !== resData.phone || current_info.phone_verify === "N") {
            phone_verify = "N";
            phone = current_info.phone;
          } else {
            phone_verify = "Y";
            phone = resData.phone;
          }
          if (current_info.email !== resData.email || current_info.email_verify === "N") {
            email_verify = "N";
            email = current_info.email;
          } else {
            email_verify = "Y";
            email = resData.email;
          }

          const updatedUser = await UserDB.findOneAndUpdate(
            { user_id: resData.user_id },
            {
              username:resData.username,
				      phone : resData.phone,
				      email: resData.email,
				      country_code : resData.country_code,
				      phone_verify : phone_verify,
				      email_verify : email_verify
            },
            { new: true } // Return the updated document
          );

          const updatedInfoUser = await UserInfoDB.findOneAndUpdate(
            { user_id: resData.user_id },
            {
              first_name: resData.firstname,
              middle_name: resData.middle_name,
              last_name: resData.lastname,
              address: resData.address,
              birth_date: resData.birth_date,
              qualification: resData.qualification,
              joining_date: resData.joining_date,
              relieve_date: ''
            },
            { new: true } // Return the updated document
          );

          if(updatedInfoUser){
          const result = {
            status: "success",
            msg: "User updated successfully",
          };
          res.json(result);
        }

        }
  };

  verify_phone = async (res, req) =>{
    let verify_phone = req.body.verify_phone;
		let country       = req.body.country;

    if (req.body.user_id != "") {
      const userWithPhone = await UserDB.findOne({
        phone: verify_phone,
        user_id: { $ne: req.body.user_id }, // Exclude current user
      });

      if(userWithPhone){
        const result = {
          status: "error",
          msg: "Phone already exist",
        };
        res.json(result);
      }else{
        const updatedUser = await UserDB.findOneAndUpdate(
          { user_id: req.body.user_id },
          {
            phone: verify_phone,
            username: verify_phone,
            phone_verify: "Y",
            country_code: country,
          },
          { new: true }
        );

        if (updatedUser) {
          const result = {
            status: "success",
            msg: "Phone verified successfully",
          };
          res.json(result);
        }
      }

    }


  }

  send_otp_email = async (res, req) =>{
    let verify_email = req.body.verify_email;

    if (req.body.user_id != "") {
      const userWithPhone = await UserDB.findOne({
        phone: verify_email,
        user_id: { $ne: req.body.user_id }, // Exclude current user
      });

      if(userWithPhone){
        const result = {
          status: "error",
          msg: "Email already exist",
        };
        res.json(result);
      }else{
        const mail_sent = await EmailInstance.sendOTPEmail(verify_email);

        if (mail_sent.status === "success") {
          // @ts-ignore
          const updatedUserOTP = await UserDB.findOneAndUpdate(
            { user_id: req.body.user_id },
            {
              otp_confirmation_key: mail_sent.otp,
            },
            { new: true } // Return the updated document
          );
          const result = {
            status: "success",
            msg: "Sent OTP Successfully",
          };
          res.json(result);
        } else {
          const result = {
            status: "error",
            msg: "email not send due to network error",
          };
          res.json(result);
        }
      }

    }


  }

  async verify_otp_email(res, req) {
    try {
      const email = req.body.verify_email;
      // @ts-ignore
      const verify_email_otp = req.body.verify_email_otp;

      const user = await UserDB.findOne({ user_id : req.body.user_id });

      if (user) {
        if (
          user.otp_confirmation_key == "" ||
          user.otp_confirmation_key == null
        ) {
          const result = { status: "otp_expired", msg: "OTP expired" };
          res.json(result);
        }

        if (user.otp_confirmation_key === verify_email_otp) {
          const updatedUser = await UserDB.findOneAndUpdate(
            { user_id: user.user_id },
            {
              otp_confirmation_key: "",
              email: email,
              username: email,
              email_verify: "Y",
              confirmed: "Y",
            },
            { new: true }
          );

          if (updatedUser) {
            const result = {
              status: "success",
              msg: "Email verified successfully",
            };
            res.json(result);
          }
        } else {
          const result = {
            status: "error",
            msg: "Please enter a valid OTP",
          };
          res.json(result);
        }
      } else {
        // Email not registered
        const result = {
          status: "error",
          msg: "Email is not registered. Please register to continue",
        };
        res.json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

}

module.exports = Login;
