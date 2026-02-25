import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ChatInterface from './components/ChatInterface/ChatInterface';
import PreviewPanel from './components/PreviewPanel/PreviewPanel';
import { ErrorBoundary, ToastContainer } from './components/common';
import { useAIChat, useToast, useLocalStorage } from './hooks';
import { DEFAULT_PREVIEW_CODE } from './config/constants';

/**
 * Main Application Component
 * Integrates all features with proper state management
 */
export default function App() {
  // Custom hooks
  const {
    messages,
    generatedCode,
    sendMessage,
    clearMessages,
    isLoading,
    isError,
    retry,
  } = useAIChat([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Builder. Describe what you'd like to create, and I'll generate the design and code for you.",
      timestamp: Date.now(),
    },
  ]);

  const { toasts, removeToast, success, error: showError } = useToast();
  const [projects, setProjects] = useLocalStorage('ai-builder-projects', []);

  // Local state
  const [currentCode, setCurrentCode] = useState(DEFAULT_PREVIEW_CODE);

  // Update code when AI generates new code
  useEffect(() => {
    if (generatedCode) {
      setCurrentCode(generatedCode);
    }
  }, [generatedCode]);

  // Handlers
  const handleSendMessage = async (content) => {
    try {
      await sendMessage(content);
      success('Design generated successfully!');
    } catch (err) {
      showError('Failed to generate design. Please try again.');
    }
  };

  const handleNewProject = () => {
    const confirmed = window.confirm('Start a new project? Current work will be saved to history.');
    if (confirmed) {
      // Save current project to history
      if (messages.length > 1) {
        const newProject = {
          id: Date.now(),
          name: `Project ${projects.length + 1}`,
          messages,
          code: currentCode,
          createdAt: new Date().toISOString(),
        };
        setProjects([newProject, ...projects]);
      }
      
      // Clear current work
      clearMessages();
      setCurrentCode(DEFAULT_PREVIEW_CODE);
      success('New project started!');
    }
  };

  const handlePublish = () => {
    success('Publishing feature coming soon!');
    console.log('Publishing project with code:', currentCode);
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-full bg-slate-100 text-slate-900 font-sans overflow-hidden">
        {/* Sidebar */}
        <Sidebar projects={projects} onNewProject={handleNewProject} />

        {/* Main Content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Chat Interface */}
          <div className="w-[350px] md:w-[400px] shrink-0 h-full">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>

          {/* Preview Panel */}
          <div className="flex-1 h-full">
            <PreviewPanel code={currentCode} onPublish={handlePublish} />
          </div>
        </main>

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </ErrorBoundary>
  );
}
