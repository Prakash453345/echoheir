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

// GET /api/conversation - Fetch recent conversations for dashboard
router.get('/', authenticateUser, async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id })
      .populate('legacyId', 'name photo relationship')
      .sort({ createdAt: -1 })
      .limit(10);

    // Format conversations for dashboard
    const formattedConversations = conversations.map(conv => ({
      _id: conv._id,
      legacyName: conv.legacyId ? conv.legacyId.name : 'Unknown',
      legacyPhoto: conv.legacyId ? conv.legacyId.photo : null,
      message: conv.message,
      time: conv.time,
      unread: conv.unread,
      emotionalTone: conv.emotionalTone,
      createdAt: conv.createdAt
    }));

    res.json({
      message: 'Conversations fetched successfully',
      conversations: formattedConversations
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      message: 'Server error fetching conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/conversation/:legacyId - Get conversation history with specific legacy
router.get('/:legacyId', authenticateUser, async (req, res) => {
  try {
    const { legacyId } = req.params;

    // Verify legacy belongs to this user
    const legacy = await Legacy.findOne({ _id: legacyId, userId: req.user._id });
    if (!legacy) {
      return res.status(404).json({ message: 'Legacy not found or unauthorized' });
    }

    const conversations = await Conversation.find({ 
      userId: req.user._id, 
      legacyId 
    })
    .sort({ createdAt: 1 }) // Oldest first for chat history
    .limit(100); // Limit to last 100 messages

    res.json({
      message: 'Conversation history fetched successfully',
      conversations,
      legacy: {
        name: legacy.name,
        photo: legacy.photo,
        relationship: legacy.relationship
      }
    });

  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({
      message: 'Server error fetching conversation history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/conversation — Save a new conversation message
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { legacyId, message, messageType = 'user' } = req.body;

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
      messageType: messageType,
      time: 'Just now',
      unread: messageType === 'ai' ? 1 : 0,
      emotionalTone: 'nostalgic'
    });

    await conversation.save();

    // Update legacy's lastActive & recentMessage
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