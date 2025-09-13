require('dotenv').config(); // 👈 MUST BE FIRST

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cors = require('cors');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration — CRITICAL FOR AUTH
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret_key_change_in_production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax'
  }
}));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/echoheir', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

// User Schema — NO NAME FIELD. NO VALIDATION ERRORS.
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Only required for local sign-up
    },
    minlength: [6, 'Password must be at least 6 characters long'],
    validate: {
      validator: function (password) {
        if (!password && this.googleId) return true;
        return password && password.length >= 6;
      },
      message: 'Password must be at least 6 characters long'
    }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
    type: String,
    validate: {
      validator: function (v) {
        if (!v) return true;
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Avatar must be a valid URL'
    }
  },
  bio: {
    type: String,
    default: '',
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  relationship: {
    type: String,
    enum: {
      values: ['Grandparent', 'Parent', 'Sibling', 'Partner', 'Other'],
      message: 'Please select a valid relationship type'
    },
    default: 'Other'
  },
  privacyLevel: {
    type: String,
    enum: {
      values: ['private', 'family', 'public'],
      message: 'Please select a valid privacy level'
    },
    default: 'private'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
});

// Add indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

const User = mongoose.model('User', userSchema);

// Passport: Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'Invalid email or password' });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Invalid email or password' });
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// ✅ FIXED Google OAuth Strategy — NO NAME FIELD
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback",
  proxy: true
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;

      // Check if user exists by email or googleId
      let user = await User.findOne({ email });
      if (user && !user.googleId) {
        user.googleId = profile.id;
        if (!user.avatar && profile.photos && profile.photos[0]) {
          user.avatar = profile.photos[0].value;
        }
        await user.save();
        return done(null, user);
      }

      user = await User.findOne({ googleId: profile.id });
      if (user) return done(null, user);

      // Create NEW user WITHOUT name field
      user = new User({
        email: email,
        googleId: profile.id,
        avatar: (profile.photos && profile.photos[0]) ? profile.photos[0].value : null,
        bio: '',
        relationship: 'Other',
        privacyLevel: 'private'
      });

      await user.save();
      return done(null, user);

    } catch (err) {
      console.error('Google OAuth Strategy Error:', err);
      return done(err, null);
    }
  }));

// Serialize / Deserialize
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Middleware: Check if authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'User not authenticated' });
};

// Routes

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, bio, relationship, privacyLevel } = req.body;

    if (!email || email.trim().length === 0) {
      return res.status(400).json({
        message: 'Email is required',
        field: 'email'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long',
        field: 'password'
      });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists. Did you sign up with Google? Try signing in with Google instead.'
      });
    }

    const user = new User({
      email: email.trim().toLowerCase(),
      password,
      bio: bio || '',
      relationship: relationship || 'Other',
      privacyLevel: privacyLevel || 'private'
    });

    await user.save();

    const userData = {
      _id: user._id,
      email: user.email,
      bio: user.bio,
      relationship: user.relationship,
      privacyLevel: user.privacyLevel,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userData
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(field => ({
        field,
        message: error.errors[field].message
      }));
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'An account with this email already exists. Did you sign up with Google? Try signing in with Google instead.'
      });
    }

    res.status(500).json({
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  passport.authenticate('local', { session: true }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Server error during login' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ message: 'Server error during login' });
      }

      const userData = {
        _id: user._id,
        email: user.email,
        bio: user.bio,
        relationship: user.relationship,
        privacyLevel: user.privacyLevel,
        createdAt: user.createdAt
      };

      res.status(200).json({
        message: 'Login successful',
        user: userData
      });
    });
  })(req, res, next);
});

app.get('/api/auth/me', isAuthenticated, (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = {
      _id: req.user._id,
      email: req.user.email,
      bio: req.user.bio,
      relationship: req.user.relationship,
      privacyLevel: req.user.privacyLevel,
      createdAt: req.user.createdAt
    };

    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

app.get('/api/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    const userData = {
      _id: req.user._id,
      email: req.user.email,
      bio: req.user.bio,
      relationship: req.user.relationship,
      privacyLevel: req.user.privacyLevel,
      createdAt: req.user.createdAt
    };
    res.json({ authenticated: true, user: userData });
  } else {
    res.json({ authenticated: false, user: null });
  }
});

// GOOGLE OAUTH ROUTES — FULL SESSIONS
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth',
    session: true
  }),
  (req, res) => {
    console.log('✅ Google OAuth success! Redirecting to frontend...');
    res.redirect('http://localhost:5173/dashboard');
  }
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;