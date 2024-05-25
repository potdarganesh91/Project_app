const UserDB = require("../../config/model");
const UserInfoDB = require("../../config/models/user_info");
const express = require('express');
const path = require("path");
const app = express();
const fs = require('fs');


class User {
  // No need for the constructor in this case

  /* Get all users. */
  async getAllUsers(res) {
    try {
      const userData = await UserDB.aggregate([
        {
          $lookup: {
            from: 'user_info',
            localField: 'user_id',
            foreignField: 'user_id',
            as: 'userInfo'
          }
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
            first_name: { $arrayElemAt: ["$userInfo.first_name", 0] },
            middle_name: { $arrayElemAt: ["$userInfo.middle_name", 0] },
            last_name: { $arrayElemAt: ["$userInfo.last_name", 0] },
            birth_date: { $arrayElemAt: ["$userInfo.birth_date", 0] },
            department: { $arrayElemAt: ["$userInfo.department", 0] },
            position: { $arrayElemAt: ["$userInfo.position", 0] },
            qualification: { $arrayElemAt: ["$userInfo.qualification", 0] },
            joining_date: { $arrayElemAt: ["$userInfo.joining_date", 0] },
            address: { $arrayElemAt: ["$userInfo.address", 0] }
          }
        }
      ]);

      for (const user of userData) {
        const rootDir = path.resolve(__dirname, '../../');
        const photoPath = path.normalize(path.join(rootDir, `upload/users/images/thumbnail/${user.user_id}.jpg`));
        user.photo = fs.existsSync(photoPath); // Set photo property

        // for pdf ----
        const pdfPath = path.normalize(path.join(rootDir, `upload/users/pdf/${user.user_id}.pdf`));
        user.file = fs.existsSync(pdfPath);
      }
      const result = {
        status: "success",
        data: userData,
        total_records: userData.length,
      };
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
 
  async addUserData(res, req) {
    const {
      username,
      first_name,
      last_name,
      address,
      phone,
      email,
      department,
      joining_date,
    } = req.body;

    try {
      const newUser = new UserDB({
        username,
        first_name,
        last_name,
        address,
        phone,
        email,
        department,
        joining_date,
      });

      await newUser.save();

      const result = {
        status: "success",
        msg: "user added successfully",
      };

      res.json(result);
    } catch (error) {
      console.error(error);
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

  async updateUserData(res, req) {
    const { user_id } = req.body; // Assuming 'id' is provided in the request body
    const {
      username,
      first_name,
      last_name,
      address,
      phone,
      email,
      department,
      joining_date,
    } = req.body;

    try {
      const updatedUser = await UserInfoDB.findOneAndUpdate(
        { user_id: user_id },
        {
          username,
          first_name,
          last_name,
          address,
          phone,
          email,
          department,
          joining_date,
        },
        { new: true } // Return the updated document
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      } else {
        const result = {
          status: "success",
          msg: "User updated successfully",
          updatedUser: updatedUser,
        };
        res.json(result);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  updateUserProfileData = async (res, req) => {

    let resData = req.body

          const updatedUser = await UserDB.findOneAndUpdate(
            { user_id: resData.user_id },
            {
              username:resData.username,
				      phone : resData.phone,
				      email: resData.email,
				      country_code : resData.country_code,
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

       
  };

  async deleteUserData(res, req) {
    const { user_id } = req.body; // Assuming 'id' is provided in the request body

    try {
      const deletedUser = await UserDB.findOneAndDelete({ user_id });
      this.delete_photo(res, req);
      this.delete_file(res, req);
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      } else {

        const result = {
          status: "success",
          msg: "User deleted successfully",
          deletedUser: deletedUser,
        };
        res.json(result);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async delete_photo(res, req) {
    const { user_id } = req.body; // Assuming 'user_id' is provided in the request body

    try {
        // Construct paths for the original photo and resized thumbnail
        const originalPhotoPath = path.join(__dirname, `../../upload/users/images/${user_id}.jpg`);
        const thumbnailPath = path.join(__dirname, `../../upload/users/images/thumbnail/${user_id}.jpg`);
        
        // Delete the original photo
        fs.unlink(originalPhotoPath, (err1) => {
            if (err1) {
                console.error("Error deleting original photo:", err1);
                res.status(500).json({ error: "Error deleting original photo" });
                return;
            }

            // Delete the resized thumbnail
            fs.unlink(thumbnailPath, (err2) => {
                if (err2) {
                    console.error("Error deleting thumbnail:", err2);
                    res.status(500).json({ error: "Error deleting thumbnail" });
                    return;
                }

                // Both files deleted successfully
                const result = {
                    status: "success",
                    msg: "Photo deleted successfully",
                };
                res.json(result);
            });
        });
    } catch (error) {
        console.error("Error deleting photo:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async delete_file(res, req) {
  const { user_id } = req.body; // Assuming 'user_id' is provided in the request body
console.log(req.body)
  try {
      // Construct paths for the original photo and resized thumbnail
      const originalPdfPath = path.join(__dirname, `../../upload/users/pdf/${user_id}.pdf`);


      // Delete the original photo
      fs.unlink(originalPdfPath, (err1) => {
          if (err1) {
              console.error("Error deleting original pdf:", err1);
              res.status(500).json({ error: err1 });
              return;
          }

              // Both files deleted successfully
              const result = {
                  status: "success",
                  msg: "PDF deleted successfully",
              };
              res.json(result);
        
      });
  } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
}


async changeUserRole(res, req){

  let resData = req.body

  const updatedUser = await UserDB.findOneAndUpdate(
    { user_id: resData.user_id },
    {
      user_role:resData.role,
    },
    { new: true } // Return the updated document
  );



  if(updatedUser){
  const result = {
    status: "success",
    msg: "Role updated successfully",
  };
  res.json(result);
}

}

async bannedUser(res, req){

  let resData = req.body

  const bannedUser = await UserDB.findOneAndUpdate(
    { user_id: resData.user_id },
    {
      banned:resData.banned,
    },
    { new: true } // Return the updated document
  );



  if(bannedUser){
  const result = {
    status: "success",
    msg: "User banned successfully",
  };
  res.json(result);
}

}
  
}

module.exports = User;  
