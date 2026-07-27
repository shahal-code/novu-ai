import express from 'express';
import auth from '../middleware/auth.js';
import {
  listConversations,
  createConversation,
  getConversationMessages,
  renameConversation,
  saveConversationMessage,
} from '../controllers/conversationController.js';

const router = express.Router();
router.use(auth);

router.get('/', listConversations);
router.post('/', createConversation);
router.get('/:id/messages', getConversationMessages);
router.patch('/:id', renameConversation);
router.post('/:id/messages', saveConversationMessage);

export default router;
