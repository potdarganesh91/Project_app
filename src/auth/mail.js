const nodemailer = require('nodemailer');

class Email {
  constructor() {
    this.transporter = nodemailer.createTransport({
      // configure your email transport here
      service: 'gmail',
      auth: {
        user: 'potdarganesh91@gmail.com',
        pass: 'kyrq lexw wizr cinc',
      },
    });
  }

  // Send confirmation email
  async confirmationEmail(email, key) {
    try {
      // Construct the email body
      const link = `REGISTER_CONFIRM?k=${key}`;

      const body = `
        <html>
          <head>
            <title>Registration Confirmation</title>
          </head>
          <body>
            <p>Dear user,</p>
            <p>Thank you for registering on our website. Please click the link below to confirm your registration:</p>
            <a href="${link}">Click here to confirm</a>
            <p>If you did not request this registration, please ignore this email.</p>
            <p>Best regards,<br>localhost</p>
          </body>
        </html>`;

      // Set mail options
      const mailOptions = {
        from: 'noreply@localhost.com',
        to: email,
        subject: 'localhost - Registration Confirmation',
        html: body,
      };

      // Send the email
      await this.transporter.sendMail(mailOptions);
      
      return { status: 'success' };

    } catch (error) {
      console.error(error);
      return { status: 'error', error_message: error.message };
    }
  }

  // Send OTP email
  async sendOTPEmail(email) {
    try {

      // Construct the email body
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const body = `
        <html>
          <head>
            <title>OTP Confirmation</title>
          </head>
          <body>
            <p>Dear user,</p>
            <p>Thank you for registering on our website. Your OTP is:</p>
            <h1>${otp}</h1>
            <p>If you did not request this registration, please ignore this email.</p>
            <p>Best regards,<br>localhost</p>
          </body>
        </html>`;

      // Set mail options
      const mailOptions = {
        from: 'noreply@localhost.com',
        to: email,
        subject: 'localhost - OTP Confirmation',
        html: body,
      };

      // Send the email
      await this.transporter.sendMail(mailOptions);

      return { status: 'success', otp };
    } catch (error) {
      return { status: 'error', otp: '', error_message: error.message };
    }
  }

  // Send welcome email
  async welcomeEmail(email) {
    try {
      // Construct the email body
      const body = `
        <html>
          <head>
            <title>Welcome to our Website</title>
          </head>
          <body>
            <p>Dear user,</p>
            <p>Welcome to our website! We are excited to have you on board.</p>
            <p>If you have any questions or need assistance, please feel free to contact us.</p>
            <p>Thank you and enjoy your time on our website!</p>
            <p>Best regards,<br>localhost</p>
          </body>
        </html>`;

      // Set mail options
      const mailOptions = {
        from: 'noreply@localhost.com',
        to: email,
        subject: 'Welcome to our Website',
        html: body,
      };

      // Send the email
      await this.transporter.sendMail(mailOptions);

      console.log('Welcome email sent');
    } catch (error) {
      console.error('Error sending welcome email', error);
    }
  }

  // Send password reset email
  async passwordResetEmail(email, key) {
    try {
      // Construct the email body
      const link = `${process.env.BASE_URL+'/'+ process.env.REGISTER_PASSWORD_RESET}?k=${key}`;
      const body = `
        <html>
          <head>
            <title>Password Reset</title>
          </head>
          <body>
            <p>Dear user,</p>
            <p>We received a request to reset your password on our website. To reset your password, please click the link below:</p>
            <a href="${link}">Reset Password</a>
            <p>If you did not request a password reset, you can safely ignore this email.</p>
            <p>Best regards,<br>Your Website Name</p>
          </body>
        </html>`;

      // Set mail options
      const mailOptions = {
        from: 'noreply@localhost.com',
        to: email,
        subject: 'Your Website Name - Password Reset',
        html: body,
      };

      // Send the email
      await this.transporter.sendMail(mailOptions);

      return { status: 'success' };
    } catch (error) {
      console.error(error);
      return { status: 'error', error_message: error.message };
    }
  }
}

module.exports = Email;
