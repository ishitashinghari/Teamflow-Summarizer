import Group from '../models/Group.js';
import Message from '../models/Message.js';
import ReadState from '../models/ReadState.js';
import { generateGroupSummary, executeDirectAIChat } from '../services/aiService.js';

export const summarizeUnreadMessages = async (req, res, next) => {
  try {
    const { groupId, localUnreadCount } = req.body;
    if (!groupId) {
      return res.status(400).json({ success: false, message: 'groupId is required.' });
    }

    const group = await Group.findOne({ _id: groupId, members: req.user._id });
    if (!group) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not in this group.' });
    }

    let unreadMessages = [];

    // FIX: If the frontend provides the unread count from before the user entered, use it!
    if (localUnreadCount && localUnreadCount > 0) {
      unreadMessages = await Message.find({ group: groupId })
        .sort({ createdAt: -1 }) // Get the latest messages
        .limit(localUnreadCount) // Only grab the amount that were unread
        .populate('sender', 'name username')
        .lean();
      
      // Reverse to restore chronological order for the AI prompt
      unreadMessages = unreadMessages.reverse(); 
    } else {
      // Fallback to database ReadState if no count is provided
      const readState = await ReadState.findOne({ user: req.user._id, group: groupId });
      const sinceDate = readState?.lastReadAt || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); 

      unreadMessages = await Message.find({
        group: groupId,
        createdAt: { $gt: sinceDate },
      })
        .sort({ createdAt: 1 })
        .limit(100)
        .populate('sender', 'name username')
        .lean();
    }

    if (unreadMessages.length === 0) {
      return res.status(200).json({
        success: true,
        summary: 'All caught up! There are no unread messages in this conversation.',
        count: 0,
      });
    }

    const summaryMarkdown = await generateGroupSummary(group.name, unreadMessages);

    res.status(200).json({
      success: true,
      summary: summaryMarkdown,
      count: unreadMessages.length,
    });
  } catch (error) {
    next(error);
  }
};

export const chatWithAssistant = async (req, res, next) => {
  try {
    const { history = [], query } = req.body;
    if (!query || query.trim() === '') {
      return res.status(400).json({ success: false, message: 'User query cannot be empty.' });
    }

    const aiReply = await executeDirectAIChat(history, query);

    res.status(200).json({
      success: true,
      reply: aiReply,
    });
  } catch (error) {
    next(error);
  }
};