import { API_CONFIG } from '../config/constants';
import { handleAPIError } from '../utils/errorHandler';

/**
 * API Service Layer - Handles all backend communication
 */

class APIService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Get auth headers
   */
  getAuthHeaders() {
    const token = this.authToken || localStorage.getItem('accessToken');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async request(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw {
          response: {
            status: response.status,
            data,
          },
        };
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      
      // handleAPIError throws, so no need to return
      handleAPIError(error);
    }
  }

  /**
   * Generate UI based on user prompt
   * @param {string} prompt - User's description
   * @param {Array} history - Chat history for context
   * @returns {Promise<Object>} Generated UI data
   */
  async generateUI(prompt, history = []) {
    return this.request('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        context: history.slice(-5), // Send last 5 messages for context
        model: 'gpt-4',
      }),
    });
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and tokens
   */
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User data and tokens
   */
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Get project list
   * @returns {Promise<Array>} List of projects
   */
  async getProjects() {
    return this.request('/projects', {
      method: 'GET',
    });
  }

  /**
   * Save project
   * @param {Object} project - Project data
   * @returns {Promise<Object>} Saved project
   */
  async saveProject(project) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  /**
   * Export code
   * @param {string} code - Code to export
   * @param {string} format - Export format (zip, github, etc.)
   * @returns {Promise<Object>} Export result
   */
  async exportCode(code, format = 'zip') {
    return this.request('/export', {
      method: 'POST',
      body: JSON.stringify({ code, format }),
    });
  }
}

// Mock API for development (when backend is not available)
class MockAPIService {
  async generateUI(prompt) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      code: `// Generated based on: "${prompt}"\n\nimport React from 'react';\n\nconst GeneratedComponent = () => {\n  return (\n    <div className="p-8">\n      <h1 className="text-4xl font-bold text-blue-600 mb-4">\n        ${prompt}\n      </h1>\n      <p className="text-gray-600">\n        This is an AI-generated component based on your prompt.\n      </p>\n    </div>\n  );\n};\n\nexport default GeneratedComponent;`,
      preview: {
        html: `<div class="p-8"><h1 class="text-4xl font-bold text-blue-600 mb-4">${prompt}</h1><p class="text-gray-600">This is an AI-generated component based on your prompt.</p></div>`,
      },
      message: `I've created a component based on your request: "${prompt}". The preview shows a clean, modern design. Would you like me to adjust anything?`,
    };
  }

  async getProjects() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 1, name: 'E-commerce App', updatedAt: new Date().toISOString() },
      { id: 2, name: 'Personal Portfolio', updatedAt: new Date().toISOString() },
      { id: 3, name: 'Dashboard UI', updatedAt: new Date().toISOString() },
    ];
  }

  async saveProject(project) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { ...project, id: Date.now(), savedAt: new Date().toISOString() };
  }

  async exportCode(code, format) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { downloadUrl: '#', format, success: true };
  }
}

// Use mock API in development, real API in production
const useMockAPI = !import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_USE_MOCK_API === 'true';

export const apiService = useMockAPI ? new MockAPIService() : new APIService();
