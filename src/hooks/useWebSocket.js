/**
 * WebSocket Hook
 * Manages real-time collaboration via Socket.IO
 */

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

export const useWebSocket = (projectId, accessToken) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    // Only connect if we have a project and token
    if (!projectId || !accessToken) return;

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);

      // Join project room
      socket.emit('join-project', { projectId });
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // User events
    socket.on('active-users', (users) => {
      setActiveUsers(users);
    });

    socket.on('user-joined', (user) => {
      setActiveUsers((prev) => [...prev, user]);
    });

    socket.on('user-left', (user) => {
      setActiveUsers((prev) =>
        prev.filter((u) => u.userId !== user.userId)
      );
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit('leave-project', { projectId });
        socket.disconnect();
      }
    };
  }, [projectId, accessToken]);

  /**
   * Send code update
   */
  const sendCodeUpdate = (code, cursor) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('code-update', {
        projectId,
        code,
        cursor,
      });
    }
  };

  /**
   * Listen for code updates
   */
  const onCodeUpdate = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('code-updated', callback);
      return () => {
        socketRef.current.off('code-updated', callback);
      };
    }
  };

  /**
   * Send chat message
   */
  const sendChatMessage = (message) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('chat-message', {
        projectId,
        message,
      });
    }
  };

  /**
   * Listen for chat messages
   */
  const onChatMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('chat-message', callback);
      return () => {
        socketRef.current.off('chat-message', callback);
      };
    }
  };

  /**
   * Send cursor position
   */
  const sendCursorMove = (position) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('cursor-move', {
        projectId,
        position,
      });
    }
  };

  /**
   * Listen for cursor movements
   */
  const onCursorMove = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('cursor-moved', callback);
      return () => {
        socketRef.current.off('cursor-moved', callback);
      };
    }
  };

  /**
   * Send typing indicator
   */
  const sendTypingIndicator = (isTyping) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(
        isTyping ? 'typing-start' : 'typing-stop',
        { projectId }
      );
    }
  };

  /**
   * Listen for typing indicators
   */
  const onTypingIndicator = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('user-typing', (data) =>
        callback(data, true)
      );
      socketRef.current.on('user-stopped-typing', (data) =>
        callback(data, false)
      );

      return () => {
        socketRef.current.off('user-typing');
        socketRef.current.off('user-stopped-typing');
      };
    }
  };

  return {
    isConnected,
    activeUsers,
    sendCodeUpdate,
    onCodeUpdate,
    sendChatMessage,
    onChatMessage,
    sendCursorMove,
    onCursorMove,
    sendTypingIndicator,
    onTypingIndicator,
  };
};

export default useWebSocket;
