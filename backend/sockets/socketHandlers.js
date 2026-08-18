import admin from '../config/firebase.js';
import User from '../models/User.js';

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

    // Room Subscription
    socket.on('group:join', (groupId) => {
      socket.join(`group:${groupId}`);
    });

    socket.on('group:leave', (groupId) => {
      socket.leave(`group:${groupId}`);
    });

    // Real-Time Messaging Relay
    socket.on('message:send', (messagePayload) => {
      if (messagePayload?.group) {
        socket.to(`group:${messagePayload.group}`).emit('message:received', messagePayload);
      }
    });

    socket.on('message:edited', (updatedMessage) => {
      if (updatedMessage?.group) {
        io.to(`group:${updatedMessage.group}`).emit('message:updated', updatedMessage);
      }
    });

    socket.on('message:deleted', (deletedMessage) => {
      if (deletedMessage?.group) {
        io.to(`group:${deletedMessage.group}`).emit('message:removed', deletedMessage);
      }
    });

    // Typing Indicators
    socket.on('typing:start', ({ groupId, username, name }) => {
      socket.to(`group:${groupId}`).emit('typing:indicator', {
        groupId,
        userId,
        username,
        name,
        isTyping: true,
      });
    });

    socket.on('typing:stop', ({ groupId }) => {
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