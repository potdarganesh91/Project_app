const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer'); // Install this module if not already installed
const cors = require('cors'); // Import the cors middleware
const app = express();
const port = 5000;
const router = express.Router();
require('./config/db');
require('dotenv').config();

const userController = require('./src/admin/actions');
const authController = require('./src/auth/actions');
const email_verify = require('./src/auth/email_verify');
const password_reset = require('./src/auth/password_reset');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// @ts-ignore
app.use(multer().array());
app.use(cors());

app.use('/admin', userController);
app.use('/auth', authController);
app.use('/email_verify', email_verify);
app.use('/password_reset', password_reset);



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
