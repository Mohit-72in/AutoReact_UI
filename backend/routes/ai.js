const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { asyncHandler, APIError } = require('../middleware/errorHandler');
const { aiLimiter } = require('../middleware/rateLimiter');

// Initialize OpenAI (only if API key exists)
const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here';
const openai = hasOpenAIKey ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

/**
 * Generate mock UI code for development
 */
const generateMockCode = (prompt) => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Different templates based on keywords
  if (lowerPrompt.includes('button')) {
    return `export default function Button() {
  return (
    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 active:scale-95">
      Click Me
    </button>
  );
}`;
  }
  
  if (lowerPrompt.includes('card') || lowerPrompt.includes('pricing')) {
    return `export default function PricingCard() {
  return (
    <div className="max-w-sm p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro Plan</h3>
      <p className="text-gray-600 mb-4">Perfect for professionals</p>
      <div className="mb-6">
        <span className="text-4xl font-bold text-gray-900">$29</span>
        <span className="text-gray-600">/month</span>
      </div>
      <ul className="space-y-3 mb-6">
        <li className="flex items-center text-gray-700">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          Unlimited projects
        </li>
        <li className="flex items-center text-gray-700">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          Priority support
        </li>
      </ul>
      <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
        Get Started
      </button>
    </div>
  );
}`;
  }
  
  if (lowerPrompt.includes('form') || lowerPrompt.includes('input')) {
    return `export default function ContactForm() {
  return (
    <form className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Name</label>
        <input 
          type="text" 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="John Doe"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Email</label>
        <input 
          type="email" 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="john@example.com"
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Message</label>
        <textarea 
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          placeholder="Your message here..."
        />
      </div>
      <button 
        type="submit"
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
      >
        Send Message
      </button>
    </form>
  );
}`;
  }
  
  // Default component
  return `export default function Component() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">
          ${prompt}
        </h1>
        <p className="text-lg mb-6 text-blue-50">
          This is a beautiful, modern component generated based on your request.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Feature 1</h3>
            <p className="text-sm text-blue-100">Responsive design</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Feature 2</h3>
            <p className="text-sm text-blue-100">Modern styling</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Feature 3</h3>
            <p className="text-sm text-blue-100">Production ready</p>
          </div>
        </div>
        <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
          Get Started
        </button>
      </div>
    </div>
  );
}`;
};

/**
 * @route   POST /api/ai/generate
 * @desc    Generate UI code from prompt
 * @access  Public (optionalAuth - works with or without login)
 */
router.post(
  '/generate',
  optionalAuth,
  aiLimiter,
  asyncHandler(async (req, res) => {
    const { prompt, context = [], model = 'gpt-4' } = req.body;

    if (!prompt) {
      throw new APIError('Prompt is required', 400);
    }
    
    // Development mode: Use mock data if OpenAI key not configured
    if (!hasOpenAIKey) {
      console.log('⚠️  Using mock AI responses (OpenAI API key not configured)');
      const mockCode = generateMockCode(prompt);
      
      return res.json({
        success: true,
        data: {
          code: mockCode,
          message: '✅ Component generated! (Development mode - add OpenAI API key for real AI)',
        },
      });
    }

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: `You are an expert frontend developer. Generate clean, modern, and responsive React component code using Tailwind CSS. 
        
IMPORTANT GUIDELINES:
- Return ONLY the JSX component code, no explanations
- Use Tailwind CSS for all styling
- Make components responsive and accessible
- Include proper props and state management
- Use modern React patterns (hooks, functional components)
- Add comments for complex logic
- Ensure code is production-ready`,
      },
      ...context.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: prompt,
      },
    ];

    try {
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const generatedCode = completion.choices[0].message.content;

      res.json({
        success: true,
        data: {
          code: generatedCode,
          message: 'Code generated successfully!',
          tokens: completion.usage,
        },
      });
    } catch (error) {
      // Handle OpenAI API errors
      if (error.response) {
        throw new APIError(
          `OpenAI API error: ${error.response.data.error.message}`,
          error.response.status
        );
      }
      throw new APIError('Failed to generate code', 500);
    }
  })
);

/**
 * @route   POST /api/ai/improve
 * @desc    Improve existing code
 * @access  Public (optionalAuth)
 */
router.post(
  '/improve',
  optionalAuth,
  aiLimiter,
  asyncHandler(async (req, res) => {
    const { code, instruction } = req.body;

    if (!code || !instruction) {
      throw new APIError('Code and instruction are required', 400);
    }
    
    // Development mode: Return mock improvement
    if (!hasOpenAIKey) {
      return res.json({
        success: true,
        data: {
          code: `// Code improved based on: ${instruction}\n${code}\n\n// Note: Add OpenAI API key for real AI improvements`,
          message: 'Code improved! (Development mode)',
        },
      });
    }

    const messages = [
      {
        role: 'system',
        content: `You are an expert code reviewer and improver. Take the existing code and improve it based on the user's instruction. Return ONLY the improved code, no explanations.`,
      },
      {
        role: 'user',
        content: `Current code:\n${code}\n\nImprovement needed: ${instruction}`,
      },
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const improvedCode = completion.choices[0].message.content;

      res.json({
        success: true,
        data: {
          code: improvedCode,
          message: 'Code improved successfully!',
        },
      });
    } catch (error) {
      if (error.response) {
        throw new APIError(
          `OpenAI API error: ${error.response.data.error.message}`,
          error.response.status
        );
      }
      throw new APIError('Failed to improve code', 500);
    }
  })
);

/**
 * @route   POST /api/ai/explain
 * @desc    Explain code
 * @access  Public (optionalAuth)
 */
router.post(
  '/explain',
  optionalAuth,
  aiLimiter,
  asyncHandler(async (req, res) => {
    const { code } = req.body;

    if (!code) {
      throw new APIError('Code is required', 400);
    }
    
    // Development mode: Return mock explanation
    if (!hasOpenAIKey) {
      return res.json({
        success: true,
        data: {
          explanation: 'This code creates a React component with modern styling using Tailwind CSS. In development mode, add an OpenAI API key to get detailed AI-powered explanations.',
        },
      });
    }

    const messages = [
      {
        role: 'system',
        content: `You are a helpful code teacher. Explain the given code in a clear, concise way. Break down the key concepts and functionality.`,
      },
      {
        role: 'user',
        content: `Explain this code:\n${code}`,
      },
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.8,
        max_tokens: 1000,
      });

      const explanation = completion.choices[0].message.content;

      res.json({
        success: true,
        data: {
          explanation,
        },
      });
    } catch (error) {
      if (error.response) {
        throw new APIError(
          `OpenAI API error: ${error.response.data.error.message}`,
          error.response.status
        );
      }
      throw new APIError('Failed to explain code', 500);
    }
  })
);

module.exports = router;
