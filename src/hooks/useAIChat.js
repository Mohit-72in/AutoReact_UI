import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import { logError, getErrorMessage } from '../utils/errorHandler';
import { RESPONSE_STATUS } from '../config/constants';

/**
 * Custom hook for AI chat functionality
 * Manages messages, loading states, and API communication
 */
export const useAIChat = (initialMessages = []) => {
  const [messages, setMessages] = useState(initialMessages);
  const [status, setStatus] = useState(RESPONSE_STATUS.IDLE);
  const [error, setError] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');

  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) {
      return;
    }

    // Add user message immediately
    const userMessage = { role: 'user', content, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setStatus(RESPONSE_STATUS.LOADING);
    setError(null);

    try {
      // Call AI API
      const response = await apiService.generateUI(content, messages);

      // Add assistant response
      const assistantMessage = {
        role: 'assistant',
        content: response.message || 'Component generated successfully!',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setGeneratedCode(response.code || '');
      setStatus(RESPONSE_STATUS.SUCCESS);

      return response;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logError(err, 'useAIChat.sendMessage');
      
      setError(errorMessage);
      setStatus(RESPONSE_STATUS.ERROR);

      // Add error message to chat
      const errorChatMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: Date.now(),
        isError: true,
      };
      setMessages(prev => [...prev, errorChatMessage]);

      throw err;
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setGeneratedCode('');
    setError(null);
    setStatus(RESPONSE_STATUS.IDLE);
  }, []);

  const retry = useCallback(async () => {
    if (messages.length === 0) return;
    
    // Get the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      // Remove the last assistant message (likely error)
      setMessages(prev => prev.slice(0, -1));
      await sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    status,
    error,
    generatedCode,
    sendMessage,
    clearMessages,
    retry,
    isLoading: status === RESPONSE_STATUS.LOADING,
    isError: status === RESPONSE_STATUS.ERROR,
  };
};
