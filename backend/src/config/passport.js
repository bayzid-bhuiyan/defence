const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy; // <-- NEW
const authService = require('../services/authService');
const userRepository = require('../repositories/userRepository');

// 1. Configure the Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback', 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await authService.handleOAuthLogin(profile);
        if (user && user.isBlocked) {
          return done(null, false, { message: 'Your account is blocked.' }); 
        }
        return done(null, user); 
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// 2. NEW: Configure the Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: '/api/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'email'] // Ask FB for these specific fields
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // We will create this specific Facebook function in the next step
        const user = await authService.handleFacebookLogin(profile);
        
        if (user && user.isBlocked) {
          return done(null, false, { message: 'Your account is blocked.' }); 
        }
        return done(null, user); 
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userRepository.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});