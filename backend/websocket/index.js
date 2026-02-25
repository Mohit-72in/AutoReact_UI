const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Initialize WebSocket server for real-time collaboration
 */
function initializeWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Store active project rooms
  const projectRooms = new Map(); // projectId -> Set of socketIds
  const userSockets = new Map(); // userId -> socketId

  // Authentication middleware for WebSocket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user
      const user = await User.findById(decoded.userId).select('-password');

      if (!user || !user.isActive) {
        return next(new Error('Invalid token'));
      }

      // Attach user to socket
      socket.userId = user._id.toString();
      socket.username = user.username;

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.username} (${socket.id})`);

    // Store user socket mapping
    userSockets.set(socket.userId, socket.id);

    /**
     * Join project room
     */
    socket.on('join-project', ({ projectId }) => {
      // Leave previous rooms
      Array.from(socket.rooms)
        .filter((room) => room !== socket.id)
        .forEach((room) => {
          socket.leave(room);
          removeFromProjectRoom(room, socket.id);
        });

      // Join new project room
      socket.join(projectId);
      addToProjectRoom(projectId, socket.id);

      // Notify others in the room
      socket.to(projectId).emit('user-joined', {
        userId: socket.userId,
        username: socket.username,
      });

      // Send current active users in the project
      const activeUsers = getProjectUsers(projectId, io);
      socket.emit('active-users', activeUsers);

      console.log(`${socket.username} joined project ${projectId}`);
    });

    /**
     * Leave project room
     */
    socket.on('leave-project', ({ projectId }) => {
      socket.leave(projectId);
      removeFromProjectRoom(projectId, socket.id);

      // Notify others
      socket.to(projectId).emit('user-left', {
        userId: socket.userId,
        username: socket.username,
      });

      console.log(`${socket.username} left project ${projectId}`);
    });

    /**
     * Code update (real-time collaboration)
     */
    socket.on('code-update', ({ projectId, code, cursor }) => {
      socket.to(projectId).emit('code-updated', {
        userId: socket.userId,
        username: socket.username,
        code,
        cursor,
        timestamp: Date.now(),
      });
    });

    /**
     * Cursor position update
     */
    socket.on('cursor-move', ({ projectId, position }) => {
      socket.to(projectId).emit('cursor-moved', {
        userId: socket.userId,
        username: socket.username,
        position,
      });
    });

    /**
     * Chat message
     */
    socket.on('chat-message', ({ projectId, message }) => {
      const chatMessage = {
        userId: socket.userId,
        username: socket.username,
        message,
        timestamp: Date.now(),
      };

      // Broadcast to all users in the project (including sender)
      io.to(projectId).emit('chat-message', chatMessage);
    });

    /**
     * Typing indicator
     */
    socket.on('typing-start', ({ projectId }) => {
      socket.to(projectId).emit('user-typing', {
        userId: socket.userId,
        username: socket.username,
      });
    });

    socket.on('typing-stop', ({ projectId }) => {
      socket.to(projectId).emit('user-stopped-typing', {
        userId: socket.userId,
      });
    });

    /**
     * Preview update
     */
    socket.on('preview-update', ({ projectId, previewHTML }) => {
      socket.to(projectId).emit('preview-updated', {
        userId: socket.userId,
        previewHTML,
        timestamp: Date.now(),
      });
    });

    /**
     * Request sync (when user rejoins)
     */
    socket.on('request-sync', ({ projectId }) => {
      // Request current state from any active user in the room
      socket.to(projectId).emit('sync-requested', {
        requesterId: socket.userId,
      });
    });

    /**
     * Send sync data
     */
    socket.on('sync-data', ({ projectId, data, requesterId }) => {
      // Send sync data to the requester
      const requesterSocketId = userSockets.get(requesterId);
      if (requesterSocketId) {
        io.to(requesterSocketId).emit('sync-received', {
          code: data.code,
          previewHTML: data.previewHTML,
          cursor: data.cursor,
        });
      }
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.username} (${socket.id})`);

      // Remove from user sockets
      userSockets.delete(socket.userId);

      // Notify all rooms this user was in
      Array.from(socket.rooms).forEach((projectId) => {
        if (projectId !== socket.id) {
          removeFromProjectRoom(projectId, socket.id);
          socket.to(projectId).emit('user-left', {
            userId: socket.userId,
            username: socket.username,
          });
        }
      });
    });

    /**
     * Error handling
     */
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.username}:`, error);
    });
  });

  // Helper functions
  function addToProjectRoom(projectId, socketId) {
    if (!projectRooms.has(projectId)) {
      projectRooms.set(projectId, new Set());
    }
    projectRooms.get(projectId).add(socketId);
  }

  function removeFromProjectRoom(projectId, socketId) {
    if (projectRooms.has(projectId)) {
      projectRooms.get(projectId).delete(socketId);
      if (projectRooms.get(projectId).size === 0) {
        projectRooms.delete(projectId);
      }
    }
  }

  function getProjectUsers(projectId, io) {
    const room = io.sockets.adapter.rooms.get(projectId);
    if (!room) return [];

    const users = [];
    room.forEach((socketId) => {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        users.push({
          userId: socket.userId,
          username: socket.username,
          socketId,
        });
      }
    });

    return users;
  }

  return io;
}

module.exports = initializeWebSocket;
