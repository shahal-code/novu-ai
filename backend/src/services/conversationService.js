import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export function normalizeConversation(conversation) {
  return {
    id: conversation._id.toString(),
    title: conversation.title,
    created_at: conversation.createdAt,
    updated_at: conversation.updatedAt,
  };
}

export function normalizeMessage(message) {
  return {
    id: message._id.toString(),
    role: message.role,
    content: message.content,
    created_at: message.createdAt,
  };
}

export async function listConversations(userId) {
  const conversations = await Conversation.find({ userId }).sort({ updatedAt: -1 }).lean();
  return conversations.map(normalizeConversation);
}

export async function createConversation(userId, title) {
  const conversation = await Conversation.create({
    userId,
    title: title.length > 50 ? `${title.slice(0, 47)}…` : title,
  });
  return normalizeConversation(conversation);
}

export async function findConversationByIdAndUser(conversationId, userId) {
  return Conversation.findOne({ _id: conversationId, userId });
}

export async function listMessages(conversationId) {
  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).lean();
  return messages.map(normalizeMessage);
}

export async function renameConversation(conversationId, userId, title) {
  const conversation = await Conversation.findOne({ _id: conversationId, userId });
  if (!conversation) return null;

  conversation.title = title.length > 50 ? `${title.slice(0, 47)}…` : title;
  conversation.updatedAt = new Date();
  await conversation.save();
  return normalizeConversation(conversation);
}

export async function saveMessage(conversationId, userId, role, content) {
  const conversation = await findConversationByIdAndUser(conversationId, userId);
  if (!conversation) return null;

  conversation.updatedAt = new Date();
  await conversation.save();

  const message = await Message.create({ conversationId, role, content });
  return normalizeMessage(message);
}
