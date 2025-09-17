const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  legacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Legacy',
    required: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
  },
  messageType: {
    type: String,
    enum: ['user', 'ai'],
    default: 'user',
  },
  time: {
    type: String,
    default: 'Just now',
  },
  unread: {
    type: Number,
    default: 0,
  },
  emotionalTone: {
    type: String,
    enum: ['joyful', 'nostalgic', 'loving', 'wise', 'peaceful', 'reflective', 'neutral', 'comforting'],
    default: 'nostalgic',
  },
  memoryReference: {
    id: String,
    type: String,
    preview: String
  }
}, { timestamps: true });

// Optional: Add indexes
conversationSchema.index({ userId: 1 });
conversationSchema.index({ legacyId: 1 });
conversationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema); // 👈 THIS IS THE MODEL