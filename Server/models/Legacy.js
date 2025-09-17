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
    min: 0
  },
  voiceTraining: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  photoCount: {
    type: Number,
    default: 0,
    min: 0
  },
  audioCount: {
    type: Number,
    default: 0,
    min: 0
  },
  textCount: {
    type: Number,
    default: 0,
    min: 0
  },
  gradient: {
    type: String,
    default: 'from-purple-400 to-indigo-500',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'training'],
    default: 'active'
  },
  
  // Training data for AI personality
  personalityTraits: {
    warmth: { type: Number, default: 70, min: 0, max: 100 },
    humor: { type: Number, default: 50, min: 0, max: 100 },
    wisdom: { type: Number, default: 80, min: 0, max: 100 },
    patience: { type: Number, default: 60, min: 0, max: 100 },
    curiosity: { type: Number, default: 40, min: 0, max: 100 }
  },
  trainingData: {
    textSamples: [{ type: String }], // Text memories/stories for training
    voiceSamples: [{ 
      filename: String,
      duration: Number,
      transcription: String,
      emotionalTone: String
    }],
    conversationStyle: {
      commonPhrases: [{ type: String }],
      vocabulary: [{ type: String }],
      emotionalPatterns: [{ type: String }]
    }
  },
  aiModelStatus: {
    type: String,
    enum: ['untrained', 'training', 'ready', 'error'],
    default: 'untrained'
  }
}, { timestamps: true });

// Optional: Add indexes for performance
legacySchema.index({ userId: 1 });
legacySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Legacy', legacySchema);