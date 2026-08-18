import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { summarizeUnreadMessages, chatWithAssistant } from '../controllers/aiController.js';

const router = express.Router();

router.use(protect);

router.post('/summarize', summarizeUnreadMessages);
router.post('/chat', chatWithAssistant);

export default router;