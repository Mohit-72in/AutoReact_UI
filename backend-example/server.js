/**
 * BACKEND API EXAMPLE - Express + OpenAI Integration
 * 
 * This is a reference implementation for the backend API.
 * Deploy this separately and update VITE_API_BASE_URL in your .env file.
 * 
 * Installation:
 * npm install express cors openai dotenv
 * 
 * Usage:
 * node backend/server.js
 */

const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI Configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Generate UI endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, history = [] } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: `You are an expert React and Tailwind CSS developer. Generate production-ready React components based on user descriptions. 
        
Rules:
- Use functional components with hooks
- Use Tailwind CSS for styling
- Include proper imports
- Make components responsive
- Follow React best practices
- Use lucide-react for icons if needed
- Return ONLY the code, no explanations unless asked

Format your response as valid JSX code.`
      },
      ...history.slice(-4).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: prompt
      }
    ];

    // Call OpenAI API
    const completion = await openai.createChatCompletion({
      model: 'gpt-4', // or 'gpt-3.5-turbo' for faster/cheaper responses
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    });

    const generatedCode = completion.data.choices[0].message.content;

    // Extract code if wrapped in markdown code blocks
    let code = generatedCode;
    const codeMatch = generatedCode.match(/```(?:jsx|javascript|js)?\n([\s\S]*?)\n```/);
    if (codeMatch) {
      code = codeMatch[1];
    }

    // Send response
    res.json({
      code,
      message: 'Component generated successfully! I\'ve created a React component based on your description.',
      preview: {
        html: code // You can add server-side rendering here if needed
      }
    });

  } catch (error) {
    console.error('Error generating UI:', error);
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      });
    }
    
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        error: 'API authentication failed. Please check server configuration.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to generate component. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get projects endpoint (example)
app.get('/api/projects', async (req, res) => {
  // In production, fetch from database
  res.json([
    { id: 1, name: 'E-commerce App', updatedAt: new Date().toISOString() },
    { id: 2, name: 'Personal Portfolio', updatedAt: new Date().toISOString() },
    { id: 3, name: 'Dashboard UI', updatedAt: new Date().toISOString() },
  ]);
});

// Save project endpoint (example)
app.post('/api/projects', async (req, res) => {
  const { name, code, messages } = req.body;
  
  // In production, save to database
  const project = {
    id: Date.now(),
    name,
    code,
    messages,
    createdAt: new Date().toISOString(),
  };

  res.json(project);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/generate`);
  console.log(`   GET  http://localhost:${PORT}/api/projects`);
  console.log(`   POST http://localhost:${PORT}/api/projects`);
});

module.exports = app;
