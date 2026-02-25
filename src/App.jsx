import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ChatInterface from './components/ChatInterface/ChatInterface';
import PreviewPanel from './components/PreviewPanel/PreviewPanel';
import AuthModal from './components/Auth/AuthModal';
import { ErrorBoundary, ToastContainer } from './components/common';
import { useAIChat, useToast, useLocalStorage } from './hooks';
import { useAuth } from './context/AuthContext';
import { apiService } from './services/api';
import { DEFAULT_PREVIEW_CODE } from './config/constants';
import { generatePreviewHTML } from './utils/codePreview';

/**
 * Main Application Component
 * Integrates all features with proper state management
 */
export default function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

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
  const [serverProjects, setServerProjects] = useState([]);

  // Local state
  const [currentCode, setCurrentCode] = useState(DEFAULT_PREVIEW_CODE);
  const [currentPreviewHTML, setCurrentPreviewHTML] = useState('');

  // Load projects from backend when user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      loadServerProjects();
    }
  }, [isAuthenticated, user]);

  const loadServerProjects = async () => {
    try {
      const response = await apiService.getProjects();
      const projects = response.data?.projects || [];
      setServerProjects(projects);
      // Optionally merge with local projects
      if (projects.length > 0) {
        success(`Loaded ${projects.length} projects from cloud`);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  // Update code and preview when AI generates new code
  useEffect(() => {
    if (generatedCode) {
      setCurrentCode(generatedCode);
      // Generate HTML preview from code
      const htmlPreview = generatePreviewHTML({ code: generatedCode });
      setCurrentPreviewHTML(htmlPreview);
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

  const handleNewProject = async () => {
    // Save current project if there's content
    if (messages.length > 1 || currentCode !== DEFAULT_PREVIEW_CODE) {
      const projectName = prompt('Enter project name:', `Project ${projects.length + 1}`);
      
      if (projectName) {
        const projectData = {
          id: Date.now(),
          name: projectName,
          messages,
          code: currentCode,
          previewHTML: currentPreviewHTML,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Save to local storage
        setProjects([projectData, ...projects.slice(0, 9)]); // Keep last 10 projects
        
        // Save to backend if logged in
        if (isAuthenticated) {
          try {
            await apiService.saveProject({
              name: projectName,
              code: currentCode,
              previewHTML: currentPreviewHTML,
              chatHistory: messages,
            });
            await loadServerProjects(); // Reload server projects
          } catch (error) {
            console.error('Failed to save to backend:', error);
            showError('Saved locally, but failed to sync with cloud');
          }
        }
        
        success(`"${projectName}" saved successfully!`);
        
        // Clear current work
        clearMessages();
        setCurrentCode(DEFAULT_PREVIEW_CODE);
        setCurrentPreviewHTML('');
      }
    } else {
      // Just start fresh if nothing to save
      clearMessages();
      setCurrentCode(DEFAULT_PREVIEW_CODE);
      setCurrentPreviewHTML('');
      success('New project started!');
    }
  };

  const handleLoadProject = (project) => {
    if (!project) return;
    
    // Load project data (handle both local and server project formats)
    const projectMessages = project.messages || project.chatHistory || [];
    const projectCode = project.code || DEFAULT_PREVIEW_CODE;
    const projectPreview = project.previewHTML || '';
    
    setMessages(projectMessages);
    setCurrentCode(projectCode);
    setCurrentPreviewHTML(projectPreview);
    
    success(`"${project.name}" loaded successfully!`);
  };

  const handlePublish = () => {
    if (!currentCode || currentCode === DEFAULT_PREVIEW_CODE) {
      showError('No code to publish. Generate a component first!');
      return;
    }

    // Create a downloadable file
    const blob = new Blob([currentCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Component.jsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    success('Component exported successfully!');
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-full bg-slate-100 text-slate-900 font-sans overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          projects={isAuthenticated ? [...serverProjects, ...projects] : projects} 
          onNewProject={handleNewProject}
          onLoadProject={handleLoadProject}
          onShowAuth={() => setShowAuthModal(true)}
          onLogout={logout}
          isAuthenticated={isAuthenticated}
          user={user}
        />

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
            <PreviewPanel 
              code={currentCode} 
              previewHTML={currentPreviewHTML}
              onPublish={handlePublish} 
            />
          </div>
        </main>

        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          initialView={isAuthenticated ? 'login' : 'login'}
        />

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </ErrorBoundary>
  );
}
