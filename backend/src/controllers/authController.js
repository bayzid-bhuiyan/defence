const prisma = require('../config/db'); 
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: '', 
  port: 465,        
  secure: true,  
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false 
  },
  connectionTimeout: 10000, 
  greetingTimeout: 10000,
  socketTimeout: 10000,
  debug: true, 
  logger: true 
});
exports.googleCallback = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/personal`);
};
exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((err) => {
      if (err) console.error("Session destruction error:", err);
      res.clearCookie('connect.sid'); 
      return res.status(200).json({ success: true, message: 'Logged out successfully' });
    });
  });
};
exports.getCurrentUser = async (req, res) => {

  if (req.user) {
    try {

      const freshUser = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      if (!freshUser || freshUser.isBlocked) {
        return req.logout((err) => {
          if (err) console.error("Logout error:", err);
          
          if (req.session) {
            req.session.destroy();
          }
          res.clearCookie('connect.sid'); 

          return res.status(403).json({ message: 'USER_BLOCKED' });
        });
      }
      return res.status(200).json({ isAuthenticated: true, user: freshUser });

    } catch (error) {
      console.error("Error fetching current user:", error);
      return res.status(500).json({ message: 'Server error' });
    }
  } else {
    return res.status(401).json({ isAuthenticated: false, message: 'Not authenticated' });
  }
};
exports.loginWithPassword = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    req.login(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({ success: true, user });
    });

  } catch (error) {
    console.error("Local login error:", error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'This email is not registered in our system.' });
    }
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); 

    await prisma.user.update({
      where: { email },
      data: { resetCode, resetCodeExpiry }
    });
    const mailOptions = {
      from: `"Brainbloom Inventory" <${process.env.EMAIL_USER}>`, 
      to: email,
      subject: 'Your Password Recovery Code - Brainbloom Inventory',
      text: `Hello,\n\nYour password recovery code is: ${resetCode}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Recovery code sent to your email.' });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: 'Server failed to send the email. Please check server logs.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.resetCode !== code || !user.resetCodeExpiry || user.resetCodeExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired recovery code.' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null
      }
    });

    res.status(200).json({ success: true, message: 'Password has been reset successfully. You can now log in.' });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: 'Server error during password reset.' });
  }
};