// server/routes/legacy.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const Legacy = require('../models/Legacy');

const authenticateUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
};

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/legacies/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'audio/mpeg' ||
        file.mimetype === 'audio/wav') {
      cb(null, true);
    } else {
      cb(new Error('Only images and audio files are allowed'), false);
    }
  }
});

// POST /api/legacy — Create legacy with photo and memories
router.post('/', authenticateUser, upload.single('photo'), async (req, res) => {
  try {
    // Parse body fields
    const {
      name,
      relationship,
      bio,
      totalMemories = 0,
      voiceTraining = 0,
      photoCount = 0,
      audioCount = 0,
      textCount = 0,
      personalityTraits = {
        warmth: 70,
        humor: 50,
        wisdom: 80,
        patience: 60,
        curiosity: 40
      }
    } = req.body;

    // Validate required fields
    if (!name || !relationship) {
      return res.status(400).json({
        message: 'Name and relationship are required',
        field: 'name'
      });
    }

    // Build legacy object
    const legacyData = {
      userId: req.user._id,
      name: name.trim(),
      relationship: relationship.toLowerCase(),
      bio: bio || '',
      photo: req.file ? req.file.path.replace(/\\/g, '/') : null, // Handle Windows paths
      totalMemories: parseInt(totalMemories) || 0,
      voiceTraining: parseInt(voiceTraining) || 0,
      photoCount: parseInt(photoCount) || 0,
      audioCount: parseInt(audioCount) || 0,
      textCount: parseInt(textCount) || 0,
      personalityTraits: JSON.parse(personalityTraits),
      lastActive: 'Just now',
      recentMessage: '',
      gradient: 'from-purple-400 to-indigo-500',
      status: 'active'
    };

    const legacy = new Legacy(legacyData);
    await legacy.save();

    // After saving legacy
await req.user.updateOne({
  $set: {
    'streak.lastActiveDate': new Date(),
    'streak.streakUpdatedToday': false
  }
});

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