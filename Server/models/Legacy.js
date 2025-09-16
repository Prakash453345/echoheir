const mongoose = require('mongoose');

const legacySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  relationship: {
    type: String,
    enum: ['Grandparent', 'Parent', 'Sibling', 'Partner', 'Other'],
    default: 'Other',
  },
  lastActive: {
    type: String,
    default: 'Just now',
  },
  photo: {
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
      message: 'Photo must be a valid URL',
    },
  },
  recentMessage: {
    type: String,
    default: '',
  },
  totalMemories: {
    type: Number,
    default: 0,
  },
  voiceTraining: {
    type: Number,
    default: 0,
  },
  gradient: {
    type: String,
    default: 'from-purple-400 to-indigo-500',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },

  photoCount: { type: Number, default: 0 },     // number of photos uploaded
  audioCount: { type: Number, default: 0 },     // number of voice recordings
  textCount: { type: Number, default: 0 },      // number of text memories (stories, notes)
}, { timestamps: true });

// Optional: Add indexes for performance
legacySchema.index({ userId: 1 });
legacySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Legacy', legacySchema); // 👈 THIS IS THE MODEL