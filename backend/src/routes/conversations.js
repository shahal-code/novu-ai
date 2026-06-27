const express = require('express');
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const router = express.Router();

// All routes require auth
router.use(auth);

// GET /api/conversations — list user conversations
router.get('/', async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.userId })
      .sort({ updatedAt: -1 })
      .lean();

    res.json(conversations.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    })));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/conversations — create new conversation
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const conversation = await Conversation.create({
      userId: req.userId,
      title: title.length > 50 ? title.slice(0, 47) + '…' : title,
    });

    res.status(201).json({
      id: conversation._id.toString(),
      title: conversation.title,
      created_at: conversation.createdAt,
      updated_at: conversation.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/conversations/:id/messages
router.get('/:id/messages', async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const messages = await Message.find({ conversationId: req.params.id })
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages.map((m) => ({
      id: m._id.toString(),
      role: m.role,
      content: m.content,
      created_at: m.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/conversations/:id/messages — save a message
router.post('/:id/messages', async (req, res) => {
  try {
    const { role, content } = req.body;
    if (!role || !content) return res.status(400).json({ error: 'role and content required' });

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    // Update conversation updatedAt
    conversation.updatedAt = new Date();
    await conversation.save();

    const message = await Message.create({
      conversationId: req.params.id,
      role,
      content,
    });

    res.status(201).json({
      id: message._id.toString(),
      role: message.role,
      content: message.content,
      created_at: message.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
