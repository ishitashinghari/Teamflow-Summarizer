import crypto from 'crypto';
import Group from '../models/Group.js';
import ReadState from '../models/ReadState.js';
import Message from '../models/Message.js';

export const createGroup = async (req, res, next) => {
  try {
    const { name, description, groupImage } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    const inviteCode = `TF-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const group = await Group.create({
      name: name.trim(),
      description: description || '',
      groupImage: groupImage || '',
      owner: req.user._id,
      admins: [req.user._id],
      members: [req.user._id],
      inviteCode,
    });

    // Create system log message
    const welcomeMsg = await Message.create({
      group: group._id,
      sender: req.user._id,
      text: `${req.user.name} created the team "${group.name}".`,
      messageType: 'system',
    });

    // Initialize Creator's Read Cursor
    await ReadState.create({
      user: req.user._id,
      group: group._id,
      lastReadMessage: welcomeMsg._id,
      lastReadAt: new Date(),
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('owner', 'name username profilePicture')
      .populate('members', 'name username profilePicture statusMessage lastActive');

    res.status(201).json({ success: true, data: populatedGroup });
  } catch (error) {
    next(error);
  }
};

export const getUserGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('owner', 'name username profilePicture')
      .populate('members', 'name username profilePicture statusMessage lastActive')
      .sort({ lastMessageAt: -1 })
      .lean();

    // Map unread message counters dynamically using ReadStates
    const enrichedGroups = await Promise.all(
      groups.map(async (grp) => {
        const readState = await ReadState.findOne({ user: req.user._id, group: grp._id });
        let unreadCount = 0;

        if (!readState || !readState.lastReadAt) {
          unreadCount = await Message.countDocuments({ group: grp._id });
        } else {
          unreadCount = await Message.countDocuments({
            group: grp._id,
            createdAt: { $gt: readState.lastReadAt },
          });
        }

        const latestMessage = await Message.findOne({ group: grp._id })
          .sort({ createdAt: -1 })
          .populate('sender', 'name username')
          .lean();

        return {
          ...grp,
          unreadCount,
          latestMessage,
        };
      })
    );

    res.status(200).json({ success: true, data: enrichedGroups });
  } catch (error) {
    next(error);
  }
};

export const joinGroupByInviteCode = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) {
      return res.status(400).json({ success: false, message: 'Invite code is required' });
    }

    const group = await Group.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    if (!group) {
      return res.status(404).json({ success: false, message: 'Invalid invite code.' });
    }

    const isMember = group.members.some((m) => m.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({ success: false, message: 'You are already a member of this group.' });
    }

    group.members.push(req.user._id);
    await group.save();

    const joinMsg = await Message.create({
      group: group._id,
      sender: req.user._id,
      text: `${req.user.name} joined using invite code.`,
      messageType: 'system',
    });

    await ReadState.findOneAndUpdate(
      { user: req.user._id, group: group._id },
      { lastReadMessage: joinMsg._id, lastReadAt: new Date() },
      { upsert: true, new: true }
    );

    const populatedGroup = await Group.findById(group._id)
      .populate('owner', 'name username profilePicture')
      .populate('members', 'name username profilePicture statusMessage lastActive');

    res.status(200).json({ success: true, data: populatedGroup });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const isAdmin = group.admins.some((a) => a.toString() === req.user._id.toString());
    const isOwner = group.owner.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Action restricted to Group Admins' });
    }

    if (group.owner.toString() === userId) {
      return res.status(400).json({ success: false, message: 'Group Owner cannot be removed' });
    }

    group.members = group.members.filter((m) => m.toString() !== userId);
    group.admins = group.admins.filter((a) => a.toString() !== userId);
    await group.save();

    await Message.create({
      group: group._id,
      sender: req.user._id,
      text: `A member was removed by ${req.user.name}.`,
      messageType: 'system',
    });

    res.status(200).json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
};