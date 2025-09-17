// server/routes/dashboard.js
const express = require('express');
const router = express.Router();

const Legacy = require('../models/Legacy');
const Conversation = require('../models/Conversation');
const Activity = require('../models/Activity');

// Middleware: Protect route
const authenticateUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
};

// Helper function to update user streak
const updateUserStreak = async (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActiveDate = new Date(user.streak.lastActiveDate);
  lastActiveDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today - lastActiveDate) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0 && user.streak.streakUpdatedToday) {
    // Already updated today, no change needed
    return user.streak;
  } else if (daysDiff === 0 && !user.streak.streakUpdatedToday) {
    // Same day, first activity - increment streak
    user.streak.currentStreak += 1;
    user.streak.streakUpdatedToday = true;
    user.streak.lastActiveDate = new Date();

    if (user.streak.currentStreak > user.streak.longestStreak) {
      user.streak.longestStreak = user.streak.currentStreak;
    }
  } else if (daysDiff === 1) {
    // Next day - continue streak
    user.streak.currentStreak += 1;
    user.streak.streakUpdatedToday = true;
    user.streak.lastActiveDate = new Date();

    if (user.streak.currentStreak > user.streak.longestStreak) {
      user.streak.longestStreak = user.streak.currentStreak;
    }
  } else if (daysDiff > 1) {
    // Streak broken - reset
    user.streak.currentStreak = 1;
    user.streak.streakUpdatedToday = true;
    user.streak.lastActiveDate = new Date();
  }

  await user.save();
  return user.streak;
};

// GET /api/dashboard — Fetch dashboard data
router.get('/', authenticateUser, async (req, res) => {
  try {
    // Update user streak
    const updatedStreak = await updateUserStreak(req.user);

    // Fetch legacies
    const legacies = await Legacy.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-trainingData'); // Exclude large training data

    // Fetch recent conversations
    const conversations = await Conversation.find({ userId: req.user._id })
      .populate('legacyId', 'name photo')
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch recent activities
    const activities = await Activity.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Helper function to extract name from email
    const getDisplayNameFromEmail = (email) => {
      if (!email) return 'User';
      const namePart = email.split('@')[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    };

    // Format legacies for frontend
    const formattedLegacies = legacies.map(legacy => ({
      ...legacy.toObject(),
      recentMessage: legacy.recentMessage || "No recent message yet.",
      lastActive: legacy.lastActive || "Just now",
      totalMemories: legacy.totalMemories || 0,
      voiceTraining: legacy.voiceTraining || 0,
      photoCount: legacy.photoCount || 0,
      audioCount: legacy.audioCount || 0,
      textCount: legacy.textCount || 0,
      status: legacy.status || 'active'
    }));

    // Format conversations for frontend
    const formattedConversations = conversations.map(conv => ({
      ...conv.toObject(),
      legacyName: conv.legacyId?.name || 'Unknown Legacy',
      time: conv.createdAt ? new Date(conv.createdAt).toLocaleString() : 'Just now'
    }));

    // Calculate real-time stats
    const totalMemories = legacies.reduce((sum, legacy) => sum + (legacy.totalMemories || 0), 0);
    const totalPhotos = legacies.reduce((sum, legacy) => sum + (legacy.photoCount || 0), 0);
    const totalAudio = legacies.reduce((sum, legacy) => sum + (legacy.audioCount || 0), 0);
    const totalText = legacies.reduce((sum, legacy) => sum + (legacy.textCount || 0), 0);

    const stats = {
      totalLegacies: legacies.length,
      totalMemories,
      totalConversations: await Conversation.countDocuments({ userId: req.user._id }),
      currentStreak: req.user.streak?.currentStreak || 0,
      longestStreak: req.user.streak?.longestStreak || 0,
      activeLegacies: legacies.filter(l => l.status === 'active').length,
      memoryDistribution: {
        photos: totalPhotos,
        audio: totalAudio,
        text: totalText,
        total: totalMemories
      }
    };

    // Prepare user display name and profile
    const displayName = req.user.name || getDisplayNameFromEmail(req.user.email);

    res.json({
      message: 'Dashboard data fetched successfully',
      user: {
        _id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        displayName,
        avatar: req.user.avatar, // This will be Google profile picture if available
        bio: req.user.bio,
        streak: req.user.streak,
        createdAt: req.user.createdAt
      },
      legacies: formattedLegacies,
      conversations: formattedConversations,
      activities,
      stats
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      message: 'Server error fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/dashboard/me — returns user + their legacies + conversations
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all legacies for this user
    const legacies = await Legacy.find({ userId })
      .select('-__v')
      .sort({ createdAt: -1 });

    // Fetch all conversations for this user (latest 4)
    const conversations = await Conversation.find({ userId })
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('legacyId', 'name'); // Populate legacy name so frontend can show "Grandma Eleanor"

    // Fetch all activities for this user (latest 4)
    const activities = await Activity.find({ userId })
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('legacyId', 'name');

    // Update streak if today's date is different from last active
    const today = new Date().toISOString().split('T')[0];
    const lastActive = req.user.streak.lastActiveDate.toISOString().split('T')[0];

    if (today !== lastActive) {
      await req.user.updateOne({
        $set: {
          'streak.lastActiveDate': new Date(),
          'streak.streakUpdatedToday': false
        }
      });
    }

    
    
    // Return data
    res.json({
      user: {
        _id: req.user._id,
        email: req.user.email,
        bio: req.user.bio,
        relationship: req.user.relationship,
        privacyLevel: req.user.privacyLevel,
        createdAt: req.user.createdAt,
      },
      legacies,
      conversations,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

module.exports = router;