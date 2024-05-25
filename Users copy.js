const UserDB = require("../../config/model");
const express = require('express');
const multer = require("multer");
const path = require("path");
const app = express();
const cors = require('cors'); // Import the cors middleware
app.use(cors());
class User {
  // No need for the constructor in this case

  /* Get all users. */
  async getAllUsers(res) {
    try {
      const userData = await UserDB.find();
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

  async getUserDetails(res, req) {
    const { user_id } = req.body;
    try {
      const UserDetails = await UserDB.findOne({ user_id });

      if (!UserDetails) {
        return res.status(404).json({ message: "User not found" });
      } else {
        var result = {
          status: "success",
          UserDetails: UserDetails,
        };
        res.json(result);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async updateUserData(res, req) {
    const { id } = req.body; // Assuming 'id' is provided in the request body
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
      const updatedUser = await UserDB.findByIdAndUpdate(
        id,
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

  async deleteUserData(res, req) {
    const { id } = req.body; // Assuming 'id' is provided in the request body

    try {
      const deletedUser = await UserDB.findByIdAndDelete(id);

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

  async upload_photo(res, req) {
    try {
        // Set up multer for file uploads
        const storage = multer.diskStorage({
          destination: function (req, file, cb) {
            cb(null, "uploads/"); // Specify the destination folder for uploads
          },
          filename: function (req, file, cb) {
            const uniqueSuffix =
              Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(
              null,
              file.fieldname +
                "-" +
                uniqueSuffix +
                path.extname(file.originalname)
            );
          },
        });
  
        const upload = multer({ storage: storage }).single("photo");
  
        // Execute the upload middleware
        upload(req, res, function (err) {
          if (err instanceof multer.MulterError) {
            return res.status(500).json({ error: "Multer Error" });
          } else if (err) {
            return res.status(500).json({ error: "Internal Server Error" });
          }
  
          // If upload is successful, save the file path to the user or wherever needed
          const imagePath = req.file.path;
  
          const result = {
            status: "success",
            msg: "Photo uploaded successfully",
            imagePath: imagePath,
          };
  
          res.json(result);
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  
}

module.exports = User;
