// server/models/User.js
const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', userSchema);