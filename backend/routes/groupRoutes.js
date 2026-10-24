import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  createGroup,
  getUserGroups,
  joinGroupByInviteCode,
  removeMember,
  updateGroup,
  leaveGroup,
} from '../controllers/groupController.js';

const router = express.Router();

router.use(protect);

router.route('/').post(createGroup).get(getUserGroups);
router.post('/join', joinGroupByInviteCode);
router.put('/:id', upload.single('file'), updateGroup);
router.post('/:id/leave', leaveGroup);
router.delete('/:id/members/:userId', removeMember);

export default router;