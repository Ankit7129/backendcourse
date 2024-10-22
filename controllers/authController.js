const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const College = require('../models/College');
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000'; // Backend URL
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'; // Frontend URL

// Send reset password email
const sendResetEmail = async (req, res) => {
  const { email, userType } = req.body;

  try {
    let user;
    if (userType === 'student') {
      user = await Student.findOne({ email });
    } else if (userType === 'college') {
      user = await College.findOne({ adminEmail: email });
    }

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Create a reset token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetUrl = `${BASE_URL}/api/auth/reset-password/${token}`; // Backend reset link

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `Click the link to reset your password: ${resetUrl}`,
      html: `<p>Click the link to reset your password: <a href="${resetUrl}">Reset Password</a></p>`, // Added HTML format
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset link sent' });
  } catch (error) {
    console.error('Error sending reset email:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Render reset password page (GET request)
// Render reset password page (GET request)
const renderResetPasswordPage = (req, res) => {
  const { token } = req.params;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Render the reset password form
    res.status(200).send(`
      <html>
        <head>
          <title>Reset Password</title>
          <style>
            /* Basic styling */
            body { font-family: Arial, sans-serif; }
            h1 { color: #333; }
            form { max-width: 300px; margin: auto; }
            input, button { display: block; width: 100%; padding: 10px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <h1>Reset Your Password</h1>
          <form action="/api/auth/reset-password/${token}" method="POST">
            <label for="newPassword">New Password:</label>
            <input type="password" id="newPassword" name="newPassword" required />
            <button type="submit">Reset Password</button>
          </form>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error rendering reset password page:', error);
    return res.status(400).send('Invalid or expired token.');
  }
};


// Handle reset password (POST request)
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Check for user in both models
    let user = await Student.findById(decoded.id);
    if (!user) {
      user = await College.findById(decoded.id);
    }

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Redirect to the client URL with a success message
    res.status(200).send(`
      <html>
        <head>
          <title>Password Reset Success</title>
          <meta http-equiv="refresh" content="3;url=${CLIENT_URL}" />
          <style>
            body { font-family: Arial, sans-serif; text-align: center; }
            h1 { color: #28a745; }
            p { font-size: 16px; }
          </style>
        </head>
        <body>
          <h1>Password Reset Successfully</h1>
          <p>Your password has been updated. You will be redirected to the Home page in a few seconds...</p>
          <a href="${CLIENT_URL}">Click here if you're not redirected.</a>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error resetting password:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).send('Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).send('Token has expired.');
    }
    res.status(500).json({ message: 'Server error' });
  }
};


const sendVerificationEmail = async (user, userType) => {
  try {
    // Create a verification token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationUrl = `${BASE_URL}/api/auth/verify-email/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userType === 'student' ? user.email : user.adminEmail,
      subject: 'Email Verification',
      text: `Click the link to verify your email: ${verificationUrl}`,
      html: `<p>Click the link to verify your email: <a href="${verificationUrl}">Verify Email</a></p>`, // Added HTML format
    };

    // Send the verification email
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
    return { success: true }; // Return a success status instead of sending a response here
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error }; // Return error information for handling
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);

    // Check for user in both models
    let user = await Student.findById(decoded.id);
    if (!user) {
      user = await College.findById(decoded.id);
    }

    if (!user) {
      return res.status(400).send(`
        <html>
          <head><title>Error</title></head>
          <body>
            <h1>User Not Found</h1>
            <p>The provided token does not correspond to a registered user.</p>
            <a href="${CLIENT_URL}">Return to Home</a>
          </body>
        </html>
      `);
    }

    // Mark the user as verified
    user.isVerified = true;
    await user.save();
    console.log('User verified:', user);

    res.status(200).send(`
      <html>
        <head><title>Email Verified</title></head>
        <body>
          <h1>Email Verified Successfully</h1>
          <p>Your email has been verified. You can now log in to your account.</p>
          <a href="${CLIENT_URL}">Go to Home Page</a>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error verifying email:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).send(`
        <html>
          <head><title>Error</title></head>
          <body>
            <h1>Invalid Token</h1>
            <p>The token provided is invalid. Please check your email for the verification link.</p>
            <a href="${CLIENT_URL}">Return to Home</a>
          </body>
        </html>
      `);
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).send(`
        <html>
          <head><title>Error</title></head>
          <body>
            <h1>Token Expired</h1>
            <p>The token has expired. Please request a new verification email.</p>
            <a href="${CLIENT_URL}">Return to Home</a>
          </body>
        </html>
      `);
    }
    
    res.status(500).send(`
      <html>
        <head><title>Server Error</title></head>
        <body>
          <h1>Server Error</h1>
          <p>There was a problem verifying your email. Please try again later.</p>
          <a href="${CLIENT_URL}">Return to Home</a>
        </body>
      </html>
    `);
  }
};

const resendVerificationEmail = async (req, res) => {
  const { email, userType } = req.body;
   // Check if email is defined
   if (!email) {
      return res.status(400).json({ message: 'Email is required' });
  }
  // Normalize email input
  const normalizedEmail = email.trim();

  try {
      let user;
      if (userType === 'student') {
          user = await Student.findOne({ email: normalizedEmail });
      } else if (userType === 'college') {
          user = await College.findOne({ adminEmail: normalizedEmail });
      }

      console.log('Found User:', user);

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Check if the user is already verified
      if (user.isVerified) {
          return res.status(400).json({ message: 'User already verified' });
      }

      // Send verification email and handle response
      const emailResult = await sendVerificationEmail(user, userType);
      if (emailResult.success) {
          return res.status(200).json({ message: 'Verification email resent' });
      } else {
          return res.status(500).json({ message: 'Failed to send verification email', error: emailResult.error });
      }
  } catch (error) {
      console.error('Error resending verification email:', error);
      res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { sendResetEmail, resetPassword, renderResetPasswordPage, sendVerificationEmail, verifyEmail ,     resendVerificationEmail 
}