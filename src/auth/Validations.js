const UserDB = require("../../config/models/users");

class Validator {
    static async isVariableEmpty(value) {
      return !value;
    }
  
    static async isEmailExist(email) {
      const existingUser = await UserDB.findOne({ email });
      return existingUser !== null;
    }

    static async isPhoneExist(phone) {
      const existingUser = await UserDB.findOne({ phone });
      return existingUser !== null;
    }
  
    static async emailValidation(email) {
      // Regular expression for basic email format validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isValid = emailRegex.test(email);
   
      return !isValid; // Return true if invalid, false if valid
   }
   
  }

  module.exports = Validator ;