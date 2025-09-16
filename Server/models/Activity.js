// server/models/Activity.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['legacy_created', 'conversation_sent', 'voice_training_complete', 'memory_added'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  legacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Legacy',
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Index for fastest recent activity queries
activitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);