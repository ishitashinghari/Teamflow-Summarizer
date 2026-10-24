import crypto from 'crypto';
import Group from '../models/Group.js';
import ReadState from '../models/ReadState.js';
import Message from '../models/Message.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';

const populateGroup = (id) =>
  Group.findById(id)
    .populate('owner', 'name username profilePicture')
    .populate('members', 'name username profilePicture statusMessage lastActive');

const isGroupAdmin = (group, userId) =>
  group.owner.toString() === userId.toString() ||
  group.admins.some((a) => a.toString() === userId.toString());

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
      text: `${req.user.name} created the group "${group.name}".`,
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
    //Without lean() - Give me a Mongoose document that I might work with.
    //With lean() - I'm just reading this data. Give me a simple JavaScript object.


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

// Admin-only: rename the group, change/remove its picture, edit description
export const updateGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!isGroupAdmin(group, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Action restricted to Group Admins' });
    }

    const { name, description, removeImage } = req.body;
    const changes = [];

    if (name !== undefined) {
      const trimmed = name.trim();
      if (!trimmed) {
        return res.status(400).json({ success: false, message: 'Group name cannot be empty' });
      }
      if (trimmed !== group.name) {
        changes.push(`renamed the group from "${group.name}" to "${trimmed}"`);
        group.name = trimmed;
      }
    }

    if (description !== undefined) group.description = description;

    if (removeImage === 'true' || removeImage === true) {
      if (group.groupImage) changes.push('removed the group photo');
      group.groupImage = '';
    }

    if (req.file) {
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ success: false, message: 'Group photo must be an image' });
      }
      const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype);
      group.groupImage = uploadResult.url;
      changes.push('updated the group photo');
    }

    await group.save();

    if (changes.length > 0) {
      await Message.create({
        group: group._id,
        sender: req.user._id,
        text: `${req.user.name} ${changes.join(' and ')}.`,
        messageType: 'system',
      });
    }

    res.status(200).json({ success: true, data: await populateGroup(group._id) });
  } catch (error) {
    next(error);
  }
};

// Any member can leave. If the owner leaves, ownership passes to an admin (else the longest-standing member).
// If the last member leaves, the group and its data are deleted.
export const leaveGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const userId = req.user._id.toString();
    if (!group.members.some((m) => m.toString() === userId)) {
      return res.status(400).json({ success: false, message: 'You are not a member of this group' });
    }

    group.members = group.members.filter((m) => m.toString() !== userId);
    group.admins = group.admins.filter((a) => a.toString() !== userId);

    if (group.members.length === 0) {
      await Message.deleteMany({ group: group._id });
      await ReadState.deleteMany({ group: group._id });
      await group.deleteOne();
      return res.status(200).json({ success: true, message: 'You left the group. It was deleted as it had no members.' });
    }

    let text = `${req.user.name} left the group.`;
    if (group.owner.toString() === userId) {
      const nextOwner = group.admins[0] || group.members[0];
      group.owner = nextOwner;
      if (!group.admins.some((a) => a.toString() === nextOwner.toString())) {
        group.admins.push(nextOwner);
      }
      text = `${req.user.name} left the group. Ownership was transferred to another member.`;
    }

    await group.save();
    await ReadState.deleteOne({ user: req.user._id, group: group._id });

    await Message.create({
      group: group._id,
      sender: req.user._id,
      text,
      messageType: 'system',
    });

    res.status(200).json({ success: true, message: 'You left the group' });
  } catch (error) {
    next(error);
  }
};
