import React from 'react';
import { 
  Sparkles, 
  Plus, 
  Settings,
  Layout,
  Code2,
  Layers,
  LogIn,
  LogOut,
  User
} from 'lucide-react';
import Button from '../common/Button';

/**
 * Sidebar Component
 * Navigation and project list
 */
const Sidebar = ({ 
  projects = [], 
  onNewProject, 
  onLoadProject, 
  onShowAuth,
  onLogout,
  isAuthenticated = false,
  user = null,
  className = '' 
}) => {
  const defaultProjects = [
    { id: 1, icon: <Layout className="w-4 h-4" />, label: "E-commerce App" },
    { id: 2, icon: <Code2 className="w-4 h-4" />, label: "Personal Portfolio" },
    { id: 3, icon: <Layers className="w-4 h-4" />, label: "Dashboard UI" }
  ];

  const projectList = projects.length > 0 ? projects : defaultProjects;

  return (
    <aside className={`w-16 md:w-64 h-full bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <span className="font-bold text-white hidden md:block text-lg tracking-tight">
          AI Builder
        </span>
      </div>
      
      {/* New Project Button */}
      <div className="px-2 mt-4">
        <Button
          variant="ghost"
          size="md"
          className="w-full bg-white/5 text-white hover:bg-white/10 rounded-xl justify-start"
          onClick={onNewProject}
          leftIcon={<Plus className="w-5 h-5" />}
          title="Start a new project"
        >
          <span className="hidden md:block">New Project</span>
        </Button>
      </div>

      {/* Recent Projects */}
      <div className="flex-1 overflow-y-auto px-2 mt-6 space-y-2">
        <div className="pt-2 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:block">
          Recent Projects
        </div>
        
        {projectList.map((item) => (
          <button 
            key={item.id} 
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
            title={item.label || item.name}
            onClick={() => onLoadProject && onLoadProject(item)}
          >
            <div className="text-slate-500 group-hover:text-primary transition-colors">
              {item.icon || <Layout className="w-4 h-4" />}
            </div>
            <span className="hidden md:block text-sm truncate">
              {item.label || item.name}
            </span>
          </button>
        ))}
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        {isAuthenticated && user ? (
          <>
            {/* User Info */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.username}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            {/* Logout Button */}
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:block text-sm">Logout</span>
            </button>
          </>
        ) : (
          /* Login Button */
          <button 
            onClick={onShowAuth}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 transition-colors"
            title="Login"
          >
            <LogIn className="w-5 h-5" />
            <span className="hidden md:block text-sm">Login / Sign Up</span>
          </button>
        )}

        <button 
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
          <span className="hidden md:block text-sm">Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
