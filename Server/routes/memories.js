const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../config/passport');
const Legacy = require('../models/Legacy');
const Conversation = require('../models/Conversation');
const Activity = require('../models/Activity');

// GET /api/memories - Fetch all memories for authenticated user with filtering
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, legacyId, search, emotion, limit = 50, offset = 0 } = req.query;

    // Build filter conditions
    let legacyFilter = { userId };
    let conversationFilter = { userId };
    let activityFilter = { userId, type: 'memory_created' };

    if (legacyId) {
      conversationFilter.legacyId = legacyId;
      activityFilter.legacyId = legacyId;
    }

    if (emotion) {
      conversationFilter.emotionalTone = emotion;
    }

    // Fetch all legacies with their memories
    const legacies = await Legacy.find(legacyFilter)
      .select('name relationship bio photo totalMemories photoCount audioCount textCount personalityTraits createdAt lastActive recentMessage status')
      .sort({ createdAt: -1 });

    // Fetch conversations based on filters
    let conversationQuery = Conversation.find(conversationFilter)
      .select('legacyId message response emotionalTone createdAt')
      .sort({ createdAt: -1 });

    if (search) {
      conversationQuery = conversationQuery.where('message').regex(new RegExp(search, 'i'));
    }

    const conversations = await conversationQuery.limit(parseInt(limit));

    // Fetch activities based on filters
    let activityQuery = Activity.find(activityFilter)
      .select('type message legacyId createdAt metadata')
      .sort({ createdAt: -1 });

    const activities = await activityQuery.limit(parseInt(limit));

    // Combine and format memories
    const memories = [];

    // Add legacy memories
    legacies.forEach(legacy => {
      memories.push({
        id: legacy._id,
        type: 'legacy',
        title: legacy.name,
        content: legacy.bio || '',
        legacyName: legacy.name,
        legacyId: legacy._id,
        relationship: legacy.relationship,
        tags: legacy.personalityTraits || [],
        emotion: 'loving',
        photoCount: legacy.photoCount || 0,
        audioCount: legacy.audioCount || 0,
        textCount: legacy.textCount || 0,
        totalMemories: legacy.totalMemories || 0,
        createdAt: legacy.createdAt,
        lastActive: legacy.lastActive,
        recentMessage: legacy.recentMessage,
        status: legacy.status || 'active'
      });
    });

    // Add conversation memories
    conversations.forEach(conv => {
      const legacy = legacies.find(l => l._id.toString() === conv.legacyId?.toString());
      memories.push({
        id: conv._id,
        type: 'conversation',
        title: `Conversation with ${legacy?.name || 'Unknown'}`,
        content: conv.message,
        message: conv.message,
        response: conv.response,
        legacyName: legacy?.name || 'Personal Memory',
        legacyId: conv.legacyId,
        relationship: legacy?.relationship || null,
        tags: [],
        emotion: conv.emotionalTone || 'nostalgic',
        emotionalTone: conv.emotionalTone,
        createdAt: conv.createdAt
      });
    });

    // Add activity memories (text-based memories)
    activities.forEach(activity => {
      if (activity.type === 'memory_created') {
        const legacy = legacies.find(l => l._id.toString() === activity.legacyId?.toString());
        
        // Extract title from message or use metadata
        let title = 'Memory';
        let content = activity.message;
        let memoryType = 'text';
        
        if (activity.metadata && activity.metadata.title) {
          title = activity.metadata.title;
          content = activity.metadata.content || activity.message;
          memoryType = activity.metadata.type || 'text';
        } else {
          // Parse title from message
          const titleMatch = activity.message.match(/Created a new .* memory: "(.*)"/);
          if (titleMatch) {
            title = titleMatch[1];
          }
        }

        memories.push({
          id: activity._id,
          type: memoryType,
          title: title,
          content: content,
          legacyName: legacy?.name || 'Personal Memory',
          legacyId: activity.legacyId,
          relationship: legacy?.relationship || null,
          tags: activity.metadata?.tags || [],
          emotion: activity.metadata?.emotion || 'nostalgic',
          createdAt: activity.createdAt
        });
      }
    });

    // Apply search filter to memories if specified
    let filteredMemories = memories;
    if (search) {
      filteredMemories = memories.filter(memory => 
        memory.title.toLowerCase().includes(search.toLowerCase()) ||
        memory.content.toLowerCase().includes(search.toLowerCase()) ||
        (memory.tags && memory.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
      );
    }

    // Apply type filter if specified
    if (type && type !== 'all') {
      filteredMemories = filteredMemories.filter(memory => memory.type === type);
    }

    // Sort all memories by creation date
    filteredMemories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedMemories = filteredMemories.slice(startIndex, endIndex);

    res.json({
      success: true,
      memories: paginatedMemories,
      totalCount: filteredMemories.length,
      legacyCount: legacies.length,
      conversationCount: conversations.length,
      hasMore: endIndex < filteredMemories.length
    });

  } catch (error) {
    console.error('Error fetching memories:', error);
    res.status(500).json({
      message: 'Server error fetching memories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/memories/:id - Delete a specific memory
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Try to find and delete from activities first
    const activity = await Activity.findOne({ _id: id, userId });
    if (activity) {
      await Activity.findByIdAndDelete(id);
      
      // Update legacy counts if associated
      if (activity.legacyId && activity.metadata) {
        const legacy = await Legacy.findById(activity.legacyId);
        if (legacy) {
          if (activity.metadata.type === 'text') {
            legacy.textCount = Math.max(0, (legacy.textCount || 0) - 1);
          }
          legacy.totalMemories = Math.max(0, (legacy.totalMemories || 0) - 1);
          await legacy.save();
        }
      }

      return res.json({
        success: true,
        message: 'Memory deleted successfully'
      });
    }

    // Try to find and delete from conversations
    const conversation = await Conversation.findOne({ _id: id, userId });
    if (conversation) {
      await Conversation.findByIdAndDelete(id);
      
      // Also delete associated activity
      await Activity.deleteOne({ 
        userId, 
        legacyId: conversation.legacyId,
        type: 'memory_created',
        message: { $regex: conversation.message }
      });

      return res.json({
        success: true,
        message: 'Conversation memory deleted successfully'
      });
    }

    res.status(404).json({
      message: 'Memory not found'
    });

  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({
      message: 'Server error deleting memory',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/memories/:id - Update a specific memory
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { title, content, tags, emotion } = req.body;

    // Try to find and update activity first
    const activity = await Activity.findOne({ _id: id, userId });
    if (activity && activity.metadata) {
      activity.metadata.title = title || activity.metadata.title;
      activity.metadata.content = content || activity.metadata.content;
      activity.metadata.tags = tags || activity.metadata.tags;
      activity.metadata.emotion = emotion || activity.metadata.emotion;
      activity.message = `Created a new ${activity.metadata.type} memory: "${activity.metadata.title}"`;
      
      await activity.save();

      return res.json({
        success: true,
        message: 'Memory updated successfully',
        memory: {
          id: activity._id,
          type: activity.metadata.type,
          title: activity.metadata.title,
          content: activity.metadata.content,
          tags: activity.metadata.tags,
          emotion: activity.metadata.emotion,
          createdAt: activity.createdAt
        }
      });
    }

    // Try to find and update conversation
    const conversation = await Conversation.findOne({ _id: id, userId });
    if (conversation) {
      conversation.message = content || conversation.message;
      conversation.emotionalTone = emotion || conversation.emotionalTone;
      
      await conversation.save();

      return res.json({
        success: true,
        message: 'Conversation memory updated successfully',
        memory: {
          id: conversation._id,
          type: 'conversation',
          title: title || `Conversation with ${conversation.legacyId}`,
          content: conversation.message,
          message: conversation.message,
          response: conversation.response,
          emotion: conversation.emotionalTone,
          createdAt: conversation.createdAt
        }
      });
    }

    res.status(404).json({
      message: 'Memory not found'
    });

  } catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({
      message: 'Server error updating memory',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/memories/search - Search memories by query
router.get('/search', authenticateUser, async (req, res) => {
  try {
    const { q, type, legacy } = req.query;
    const userId = req.user._id;

    if (!q) {
      return res.status(400).json({
        message: 'Search query is required'
      });
    }

    const searchResults = [];

    // Search in activities (text memories)
    const activities = await Activity.find({
      userId,
      type: 'memory_created',
      $or: [
        { message: { $regex: q, $options: 'i' } },
        { 'metadata.title': { $regex: q, $options: 'i' } },
        { 'metadata.content': { $regex: q, $options: 'i' } },
        { 'metadata.tags': { $in: [new RegExp(q, 'i')] } }
      ]
    }).populate('legacyId', 'name relationship');

    activities.forEach(activity => {
      if (activity.metadata) {
        searchResults.push({
          id: activity._id,
          type: activity.metadata.type || 'text',
          title: activity.metadata.title || 'Memory',
          content: activity.metadata.content || activity.message,
          tags: activity.metadata.tags || [],
          emotion: activity.metadata.emotion || 'nostalgic',
          legacyName: activity.legacyId?.name || 'Personal Memory',
          createdAt: activity.createdAt
        });
      }
    });

    // Search in conversations
    const conversations = await Conversation.find({
      userId,
      $or: [
        { message: { $regex: q, $options: 'i' } },
        { response: { $regex: q, $options: 'i' } }
      ]
    }).populate('legacyId', 'name relationship');

    conversations.forEach(conv => {
      searchResults.push({
        id: conv._id,
        type: 'conversation',
        title: `Conversation with ${conv.legacyId?.name || 'Unknown'}`,
        content: conv.message,
        message: conv.message,
        response: conv.response,
        emotion: conv.emotionalTone || 'nostalgic',
        legacyName: conv.legacyId?.name || 'Personal Memory',
        createdAt: conv.createdAt
      });
    });

    // Sort by relevance and date
    searchResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      results: searchResults,
      totalCount: searchResults.length,
      query: q
    });

  } catch (error) {
    console.error('Error searching memories:', error);
    res.status(500).json({
      message: 'Server error searching memories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/memories - Create a new standalone memory
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, title, content, legacyId, tags, emotion } = req.body;

    // Validate required fields
    if (!type || !title) {
      return res.status(400).json({
        message: 'Memory type and title are required'
      });
    }

    // Validate legacy exists if provided
    let legacy = null;
    if (legacyId) {
      legacy = await Legacy.findOne({ _id: legacyId, userId });
      if (!legacy) {
        return res.status(404).json({ message: 'Legacy not found' });
      }
    }

    if (type === 'text') {
      // Create a text-based memory
      const activity = new Activity({
        userId,
        legacyId: legacyId || null,
        type: 'memory_created',
        message: `Created a new text memory: "${title}"`,
        metadata: {
          type: 'text',
          title: title,
          content: content || '',
          tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
          emotion: emotion || 'nostalgic'
        },
        createdAt: new Date()
      });
      await activity.save();

      // If associated with a legacy, update legacy stats
      if (legacy) {
        legacy.textCount = (legacy.textCount || 0) + 1;
        legacy.totalMemories = (legacy.totalMemories || 0) + 1;
        await legacy.save();
      }

      res.status(201).json({
        message: 'Text memory created successfully',
        memory: {
          id: activity._id,
          type: 'text',
          title,
          content: content || '',
          legacyName: legacy?.name || 'Personal Memory',
          legacyId: legacyId || null,
          relationship: legacy?.relationship || null,
          tags: activity.metadata.tags,
          emotion: activity.metadata.emotion,
          createdAt: activity.createdAt
        }
      });

    } else if (type === 'conversation') {
      // Create a conversation memory
      const conversation = new Conversation({
        userId,
        legacyId: legacyId || null,
        message: content,
        response: '', // Empty for now, could be filled by AI later
        emotionalTone: emotion || 'nostalgic',
        createdAt: new Date()
      });
      await conversation.save();

      // Create activity for tracking
      const activity = new Activity({
        userId,
        legacyId: legacyId || null,
        type: 'memory_created',
        message: `Created a new conversation memory: "${title}"`,
        metadata: {
          type: 'conversation',
          title: title,
          content: content || '',
          tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
          emotion: emotion || 'nostalgic'
        },
        createdAt: new Date()
      });
      await activity.save();

      res.status(201).json({
        message: 'Conversation memory created successfully',
        memory: {
          id: conversation._id,
          type: 'conversation',
          title,
          content: content || '',
          message: content || '',
          response: '',
          legacyName: legacy?.name || 'Personal Memory',
          legacyId: legacyId || null,
          relationship: legacy?.relationship || null,
          tags: activity.metadata.tags,
          emotion: activity.metadata.emotion,
          emotionalTone: emotion || 'nostalgic',
          createdAt: conversation.createdAt
        }
      });

    } else {
      return res.status(400).json({
        message: 'Invalid memory type. Supported types: text, conversation'
      });
    }

  } catch (error) {
    console.error('Error creating memory:', error);
    res.status(500).json({
      message: 'Server error creating memory',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/memories/legacies - Get all legacies for dropdown
router.get('/legacies', authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const legacies = await Legacy.find({ userId })
      .select('name relationship bio photo')
      .sort({ name: 1 });

    res.json({
      success: true,
      legacies
    });

  } catch (error) {
    console.error('Error fetching legacies:', error);
    res.status(500).json({
      message: 'Server error fetching legacies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
