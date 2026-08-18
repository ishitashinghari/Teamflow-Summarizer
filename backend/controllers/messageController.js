import Message from '../models/Message.js';
import Group from '../models/Group.js';
import ReadState from '../models/ReadState.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';

export const getGroupMessages = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const group = await Group.findOne({ _id: groupId, members: req.user._id });
    if (!group) {
      return res.status(403).json({ success: false, message: 'Access forbidden: Not a group member.' });
    }

    const messages = await Message.find({ group: groupId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name username profilePicture')
      .lean();

    const totalMessages = await Message.countDocuments({ group: groupId });

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page,
        limit,
        total: totalMessages,
        hasMore: totalMessages > skip + messages.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { groupId, text } = req.body;
    let messageType = 'text';
    let fileUrl = '';
    let fileName = '';
    let fileSize = 0;
    let mimeType = '';
    let cloudinaryPublicId = '';

    const group = await Group.findOne({ _id: groupId, members: req.user._id });
    if (!group) {
      return res.status(403).json({ success: false, message: 'You are not a member of this group.' });
    }

    if (req.file) {
      fileName = req.file.originalname;
      fileSize = req.file.size;
      mimeType = req.file.mimetype;

      if (mimeType.startsWith('image/')) messageType = 'image';
      else if (mimeType.startsWith('video/')) messageType = 'video';
      else messageType = 'document';

      const uploadResult = await uploadToCloudinary(req.file.buffer, fileName, mimeType);
      fileUrl = uploadResult.url;
      cloudinaryPublicId = uploadResult.publicId;
    } else if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }

    const newMessage = await Message.create({
      group: groupId,
      sender: req.user._id,
      text: text || '',
      messageType,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      cloudinaryPublicId,
    });

    group.lastMessageAt = new Date();
    await group.save();

    // Advance sender's read cursor immediately
    await ReadState.findOneAndUpdate(
      { user: req.user._id, group: groupId },
      { lastReadMessage: newMessage._id, lastReadAt: new Date() },
      { upsert: true }
    );

    const populatedMessage = await Message.findById(newMessage._id).populate(
      'sender',
      'name username profilePicture'
    );

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    next(error);
  }
};

export const editMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this message' });
    }

    if (message.isDeleted) {
      return res.status(400).json({ success: false, message: 'Cannot edit a deleted message' });
    }

    message.text = text;
    message.isEdited = true;
    await message.save();

    const populated = await Message.findById(message._id).populate('sender', 'name username profilePicture');
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this message' });
    }

    // Soft deletion paradigm
    message.isDeleted = true;
    message.text = 'This message was deleted';
    message.fileUrl = '';
    message.fileName = '';
    await message.save();

    const populated = await Message.findById(message._id).populate('sender', 'name username profilePicture');
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const markGroupMessagesAsRead = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const latestMessage = await Message.findOne({ group: groupId }).sort({ createdAt: -1 });

    const readState = await ReadState.findOneAndUpdate(
      { user: req.user._id, group: groupId },
      {
        lastReadMessage: latestMessage ? latestMessage._id : null,
        lastReadAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, data: readState });
  } catch (error) {
    next(error);
  }
};

export const searchGroupMessages = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(200).json({ success: true, data: [] });
    }

    const messages = await Message.find({
      group: groupId,
      isDeleted: false,
      text: { $regex: q.trim(), $options: 'i' },
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('sender', 'name username profilePicture');

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};