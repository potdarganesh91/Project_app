const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const app = express();
const path = require('path'); // Import the path module

const port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    },
  }));

require('./config/db');
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const userActions = require('./src/admin/actions');
const authController = require('./src/auth/actions');
const email_verify = require('./src/auth/email_verify');
const password_reset = require('./src/auth/password_reset');
const uploadFileController = require('./src/common/FileUploader')
const uploadPhotoPDF = require('./src/admin/uploadFileController')

app.use('/upload', express.static(path.join(__dirname, 'upload'))); // for photo upload -------

app.use('/admin', userActions);
app.use('/auth', authController);
app.use('/email_verify', email_verify);
app.use('/password_reset', password_reset);
app.use('/upload', uploadFileController);
app.use('/uploadFile', uploadPhotoPDF);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
