import * as conversationService from '../services/conversationService.js';

export async function listConversations(req, res) {
  try {
    const conversations = await conversationService.listConversations(req.userId);
    res.json(conversations);
  } catch (err) {
    console.error('List conversations error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function createConversation(req, res) {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const conversation = await conversationService.createConversation(req.userId, title);
    res.status(201).json(conversation);
  } catch (err) {
    console.error('Create conversation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getConversationMessages(req, res) {
  try {
    const conversation = await conversationService.findConversationByIdAndUser(req.params.id, req.userId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const messages = await conversationService.listMessages(req.params.id);
    res.json(messages);
  } catch (err) {
    console.error('Get conversation messages error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function renameConversation(req, res) {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const conversation = await conversationService.renameConversation(req.params.id, req.userId, title);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    res.json(conversation);
  } catch (err) {
    console.error('Rename conversation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function saveConversationMessage(req, res) {
  try {
    const { role, content } = req.body;
    if (!role || !content) return res.status(400).json({ error: 'role and content required' });

    const message = await conversationService.saveMessage(req.params.id, req.userId, role, content);
    if (!message) return res.status(404).json({ error: 'Conversation not found' });

    res.status(201).json(message);
  } catch (err) {
    console.error('Save conversation message error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
