import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  getGroupMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markGroupMessagesAsRead,
  searchGroupMessages,
} from '../controllers/messageController.js';

const router = express.Router();

router.use(protect);

router.get('/group/:groupId', getGroupMessages);
router.post('/', upload.single('file'), sendMessage);
router.put('/:messageId', editMessage);
router.delete('/:messageId', deleteMessage);
router.post('/group/:groupId/read', markGroupMessagesAsRead);
router.get('/group/:groupId/search', searchGroupMessages);

export default router;