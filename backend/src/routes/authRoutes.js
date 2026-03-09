const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err || !user) {
      console.error("Login rejected or failed:", err || info);
      return res.redirect(`${process.env.CLIENT_URL}/blocked`);
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) return res.redirect(`${process.env.CLIENT_URL}/blocked`);
      return authController.googleCallback(req, res);
    });
  })(req, res, next);
});

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback', (req, res, next) => {
  passport.authenticate('facebook', (err, user, info) => {
    if (err || !user) {
      console.error("Facebook Login rejected or failed:", err || info);
      return res.redirect(`${process.env.CLIENT_URL}/blocked`);
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) return res.redirect(`${process.env.CLIENT_URL}/blocked`);
      return authController.googleCallback(req, res);
    });
  })(req, res, next);
});
router.post('/login', authController.loginWithPassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/current-user', authController.getCurrentUser);
router.get('/logout', authController.logout);

module.exports = router;