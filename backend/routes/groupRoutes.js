import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createGroup,
  getUserGroups,
  joinGroupByInviteCode,
  removeMember,
} from '../controllers/groupController.js';

const router = express.Router();

router.use(protect);

router.route('/').post(createGroup).get(getUserGroups);
router.post('/join', joinGroupByInviteCode);
router.delete('/:id/members/:userId', removeMember);

export default router;