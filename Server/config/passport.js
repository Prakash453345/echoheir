// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require('../models/User');

// require('dotenv').config();

// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: "/auth/google/callback",
//   proxy: true // Required if behind proxy (e.g., Heroku, Vercel)
// },
// async (accessToken, refreshToken, profile, done) => {
//   try {
//     let user = await User.findOne({ googleId: profile.id });

//     if (user) {
//       return done(null, user); // User exists
//     }

//     // Create new user
//     user = new User({
//       name: profile.displayName,
//       email: profile.emails[0].value,
//       googleId: profile.id,
//       avatar: profile.photos[0].value
//     });

//     await user.save();
//     return done(null, user);

//   } catch (err) {
//     return done(err, null);
//   }
// }));

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   User.findById(id, (err, user) => {
//     done(err, user);
//   });
// });

// Authentication middleware - simplified for development
const authenticateUser = (req, res, next) => {
  // For development, create a mock user
  req.user = {
    _id: '507f1f77bcf86cd799439011', // Mock user ID
    name: 'Test User',
    email: 'test@example.com'
  };
  return next();
};

module.exports = {
  authenticateUser
};