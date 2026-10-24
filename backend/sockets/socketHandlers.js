import admin from '../config/firebase.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Message from '../models/Message.js';

// In-Memory Presence Registry: Map<userId, Set<socketId>>
const onlinePresence = new Map();

export const registerSocketHandlers = (io) => {
  // Enforce Firebase Authentication Middleware on Socket.IO Handshakes
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Socket Authentication Failed: Missing Token'));
      }

      const decoded = await admin.auth().verifyIdToken(token);
      const user = await User.findOne({ firebaseUid: decoded.uid });

      if (!user) {
        return next(new Error('Socket Authentication Failed: User Not In DB'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error('[Socket Auth Middleware Error]:', err.message);
      next(new Error('Authentication Failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`[Socket Connected] User: ${socket.user.username} (Socket: ${socket.id})`);

    // Track multi-tab presence
    if (!onlinePresence.has(userId)) {
      onlinePresence.set(userId, new Set());
    }
    onlinePresence.get(userId).add(socket.id);

    // Broadcast updated active presence roster
    io.emit('presence:update', Array.from(onlinePresence.keys()));

    const inRoom = (groupId) => socket.rooms.has(`group:${groupId}`);

    // Loads a saved message and returns it only if this socket's user sent it
    // and still belongs to its group. Relays use the DB copy, never the client payload.
    const loadOwnMessage = async (messageId) => {
      if (!messageId) return null;
      const message = await Message.findById(messageId).populate('sender', 'name username profilePicture');
      if (!message || message.sender._id.toString() !== userId) return null;
      const isMember = await Group.exists({ _id: message.group, members: userId });
      return isMember ? message : null;
    };

    // Room Subscription (members only)
    socket.on('group:join', async (groupId) => {
      try {
        const isMember = await Group.exists({ _id: groupId, members: userId });
        if (isMember) socket.join(`group:${groupId}`);
      } catch (err) {
        console.error('[Socket group:join Error]:', err.message);
      }
    });

    socket.on('group:leave', (groupId) => {
      socket.leave(`group:${groupId}`);
    });

    // Real-Time Messaging Relay
    socket.on('message:send', async (payload) => {
      try {
        const message = await loadOwnMessage(payload?._id);
        if (message) socket.to(`group:${message.group}`).emit('message:received', message.toObject());
      } catch (err) {
        console.error('[Socket message:send Error]:', err.message);
      }
    });

    socket.on('message:edited', async (payload) => {
      try {
        const message = await loadOwnMessage(payload?._id);
        if (message) io.to(`group:${message.group}`).emit('message:updated', message.toObject());
      } catch (err) {
        console.error('[Socket message:edited Error]:', err.message);
      }
    });

    socket.on('message:deleted', async (payload) => {
      try {
        const message = await loadOwnMessage(payload?._id);
        if (message) io.to(`group:${message.group}`).emit('message:removed', message.toObject());
      } catch (err) {
        console.error('[Socket message:deleted Error]:', err.message);
      }
    });

    // Typing Indicators (only into rooms this socket has joined)
    socket.on('typing:start', ({ groupId, username, name } = {}) => {
      if (!inRoom(groupId)) return;
      socket.to(`group:${groupId}`).emit('typing:indicator', {
        groupId,
        userId,
        username,
        name,
        isTyping: true,
      });
    });

    socket.on('typing:stop', ({ groupId } = {}) => {
      if (!inRoom(groupId)) return;
      socket.to(`group:${groupId}`).emit('typing:indicator', {
        groupId,
        userId,
        isTyping: false,
      });
    });

    // Cleanup on Disconnection
    socket.on('disconnect', async () => {
      const userSockets = onlinePresence.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlinePresence.delete(userId);
          await User.findByIdAndUpdate(userId, { lastActive: new Date() });
        }
      }
      io.emit('presence:update', Array.from(onlinePresence.keys()));
      console.log(`[Socket Disconnected] User: ${socket.user.username}`);
    });
  });
};