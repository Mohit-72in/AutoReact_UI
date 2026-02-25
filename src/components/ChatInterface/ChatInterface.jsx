import React, { useState, useRef, useEffect } from 'react';
import { History, Send } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { cn } from '../../utils/cn';

/**
 * Message Component
 */
const Message = ({ message }) => {
  return (
    <div className={cn(
      'flex',
      message.role === 'user' ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'max-w-[85%] p-3 rounded-2xl text-sm',
        message.role === 'user' 
          ? 'bg-blue-600 text-white shadow-md' 
          : message.isError
            ? 'bg-red-50 border border-red-200 text-red-700 shadow-sm'
            : 'bg-white border border-slate-200 text-slate-700 shadow-sm'
      )}>
        {message.content}
      </div>
    </div>
  );
};

/**
 * Chat Interface Component
 * Main chat UI with message list and input
 */
const ChatInterface = ({ 
  messages = [], 
  onSendMessage, 
  isLoading = false,
  className = '' 
}) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-slate-50 border-r border-slate-200', className)}>
      {/* Header */}
      <div className="p-4 border-b bg-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          <h2 className="font-semibold text-slate-700">Builder Chat</h2>
        </div>
        <div className="flex gap-2 items-center">
          <div className={cn(
            'h-2 w-2 rounded-full transition-colors',
            isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse'
          )}></div>
          <span className="text-[10px] text-slate-400 font-bold tracking-tighter uppercase">
            {isLoading ? 'THINKING' : 'ONLINE'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            <p>Start a conversation to begin building...</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <Message key={idx} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSubmit} className="relative">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "AI is thinking..." : "Describe your design..."}
            disabled={isLoading}
            className="pr-12"
          />
          <Button
            type="submit"
            size="icon"
            variant="primary"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            disabled={!input.trim() || isLoading}
            isLoading={isLoading}
          >
            {!isLoading && <Send className="w-4 h-4" />}
          </Button>
        </form>
        <p className="text-[10px] text-slate-400 mt-2 text-center uppercase tracking-widest font-bold">
          Powered by Builder AI
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
