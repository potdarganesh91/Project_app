const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer'); // Install this module if not already installed
const cors = require('cors'); // Import the cors middleware
const User = require('./config/model');
const connectDB = require('./config/db');
const app = express();
const port = 5000;
connectDB();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// @ts-ignore
app.use(multer().array());
app.use(cors());

app.use('/actions', async (req, res) => {
    const action = req.body.action;
    var result = {};
    switch (action) {

        case 'getAllUserData':   
        try {
            const Userdata = await User.find();
                 result = {
                    'status': "success",
                    'data' : Userdata,
                    'total_records' : Userdata.length,
                }
                res.json(result);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }

            break;

        case 'addUserData':
            const { username,
                first_name,
                last_name,
                address,
                phone,
                email,
                department,
                joining_date } = req.body;
            const newUser = new User({ username,
                first_name,
                last_name,
                address,
                phone,
                email,
                department,
                joining_date });
            await newUser.save();
             result = {
                "status" : "success",
                "msg"    : "user added successfully"
            }
            res.json(result);
            break;

        case 'getUserDeatils':
            const { id } = req.body;
            try {
                const UserDetails = await User.findById(id);
                
                if (!UserDetails) {
                  return res.status(404).json({ message: 'Task not found' });
                }else{
                    result = {
                        "status" : "success",
                        "UserDetails"    : UserDetails
                    }
                    res.json(result);
                }
            
                
              } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal Server Error' });
              }
        break;
        
        case "updateUserData":

        break;

        case 'login_check':
            // Handle login logic
            res.json({ message: 'Login successful' });
            break;

        default:
            res.status(400).json({ message: 'Invalid action' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
