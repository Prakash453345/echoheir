// server/routes/conversation.js
const express = require('express');
const router = express.Router();

const Conversation = require('../models/Conversation');
const Legacy = require('../models/Legacy');

// Middleware: Protect route
const authenticateUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
};

// POST /api/conversation — Save a new conversation message
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { legacyId, message } = req.body;

    // Validate inputs
    if (!legacyId || !message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Legacy ID and message are required' });
    }

    // Verify legacy belongs to this user
    const legacy = await Legacy.findOne({ _id: legacyId, userId: req.user._id });
    if (!legacy) {
      return res.status(404).json({ message: 'Legacy not found or unauthorized' });
    }

    // Create conversation entry
    const conversation = new Conversation({
      userId: req.user._id,
      legacyId,
      message: message.trim(),
      time: 'Just now',
      unread: 0,
      emotionalTone: 'nostalgic'
    });

    await conversation.save();

    // Optional: Update legacy’s lastActive & recentMessage
    await Legacy.findByIdAndUpdate(
      legacyId,
      {
        lastActive: 'Just now',
        recentMessage: message.trim()
      },
      { new: true }
    );

    res.status(201).json({
      message: 'Message sent',
      conversation
    });

  } catch (error) {
    console.error('Error saving conversation:', error);
    res.status(500).json({ message: 'Server error saving conversation' });
  }
});

module.exports = router;