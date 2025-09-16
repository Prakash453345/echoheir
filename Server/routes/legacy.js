// server/routes/legacy.js
const express = require('express');
const router = express.Router();

const Legacy = require('../models/Legacy');

const authenticateUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
};

router.post('/', authenticateUser, async (req, res) => {

   console.log('🔥 req.user:', req.user); // 👈 ADD THIS LINE
  console.log('🔥 isAuthenticated:', req.isAuthenticated()); // 👈 ADD THIS LINE

  try {
    const { 
      name, 
      relationship, 
      bio, 
      photo, 
      totalMemories, 
      voiceTraining, 
      photoCount, 
      audioCount, 
      textCount, 
      personalityTraits 
    } = req.body;

    if (!name || !relationship) {
      return res.status(400).json({
        message: 'Name and relationship are required',
        field: 'name'
      });
    }

    const legacy = new Legacy({
      userId: req.user._id,
      name: name.trim(),
      relationship: relationship.toLowerCase(),
      bio: bio || '',
      photo: photo || null,
      totalMemories: totalMemories || 0,
      voiceTraining: voiceTraining || 0,
      photoCount: photoCount || 0,
      audioCount: audioCount || 0,
      textCount: textCount || 0,
      personalityTraits: personalityTraits || {
        warmth: 70,
        humor: 50,
        wisdom: 80,
        patience: 60,
        curiosity: 40
      },
      lastActive: 'Just now',
      recentMessage: '',
      gradient: 'from-purple-400 to-indigo-500',
      status: 'active'
    });

    await legacy.save();

    res.status(201).json({
      message: 'Legacy created successfully',
      legacy
    });

  } catch (error) {
    console.error('Error creating legacy:', error);
    res.status(500).json({
      message: 'Server error creating legacy',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;