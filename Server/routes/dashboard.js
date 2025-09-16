// server/routes/dashboard.js
const express = require('express');
const router = express.Router();

const Legacy = require('../models/Legacy');
const Conversation = require('../models/Conversation');

// Middleware: Protect route
const authenticateUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: 'Authentication required' });
};

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
            .populate('legacyId', 'name'); // 👈 Populate legacy name so frontend can show "Grandma Eleanor"

        // Fetch all activities for this user (latest 4)
        const activities = await Activity.find({ userId })
            .select('-__v')
            .sort({ createdAt: -1 })
            .limit(4)
            .populate('legacyId', 'name');
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