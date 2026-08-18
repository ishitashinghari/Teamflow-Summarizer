import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js'; // Import Multer
import { syncUserProfile, getCurrentUserProfile, updateProfile } from '../controllers/userController.js';

const router = express.Router();

router.post('/sync', protect, syncUserProfile);
router.get('/me', protect, getCurrentUserProfile);
// Add upload.single('file') here
router.put('/me', protect, upload.single('file'), updateProfile); 

export default router;