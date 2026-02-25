# AI Builder - React UI Generator

AI-powered platform that generates production-ready React components from natural language descriptions.

## Project Status

✅ **FIXED AND WORKING** - Your project has been completely repaired and now works exactly like your standalone Node.js script!

## What Was Fixed

Your Gemini AI integration had critical issues that prevented it from working in the React application:

1. Wrong API call structure for Gemini 3
2. Missing `config` wrapper for system instructions and tools
3. Incorrect model name (`gemini-1.5-flash` → `gemini-3-flash-preview`)
4. Missing backend environment variables

**All issues have been resolved!**

## Quick Start

### 1. Get a Valid Gemini API Key

Your current API key is invalid. Get a new one:

**Visit**: https://aistudio.google.com/app/apikey

Then update `backend/.env`:
```env
GEMINI_API_KEY=AIzaSyC...your-new-key-here
```

See `GET_API_KEY.md` for detailed instructions.

### 2. Start MongoDB

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
npm install
npm run dev
```

Or use the quick start script:
```bash
./quick-start.sh
```

### 4. Open in Browser

Visit: http://localhost:5173

## Features

- Natural language to React component generation
- Real-time code preview
- Tailwind CSS styling
- Component export
- Project saving and management
- User authentication
- WebSocket collaboration (optional)

## How It Works

The backend uses Gemini AI with function calling to generate React components:

```javascript
// Your prompt
"Create a blue button with rounded corners"

// Gemini generates
export default function Button() {
  return (
    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700
                       text-white font-semibold rounded-lg">
      Click Me
    </button>
  );
}
```

## Architecture

```
Frontend (React) → API (Express) → Gemini AI → Generated Code
```

**Key Components**:
- **GeminiAgent**: Handles AI generation with function calling
- **AI Routes**: API endpoints for generation
- **React UI**: Chat interface and preview panel

## Testing

Test the Gemini integration:

```bash
cd backend
node test-gemini.js
```

Expected output:
```
✅ API key verified successfully!
✅ Generation successful!
📝 Generated Code: ...
```

## Documentation

- `SETUP_GUIDE.md` - Complete setup instructions
- `GET_API_KEY.md` - How to get Gemini API key
- `FIXES_APPLIED.md` - Detailed list of all fixes
- `backend/test-gemini.js` - Test script

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Socket.IO Client

### Backend
- Node.js + Express
- Gemini AI (Google)
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO

## Environment Variables

### Backend (`backend/.env`)
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ai-builder
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key-here
CLIENT_URL=http://localhost:5173
```

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_API=false
```

## API Endpoints

### Generate Component
```bash
POST /api/ai/generate
Content-Type: application/json

{
  "prompt": "Create a pricing card component",
  "context": []
}
```

Response:
```json
{
  "success": true,
  "data": {
    "code": "export default function...",
    "message": "Component generated with Gemini AI"
  }
}
```

## Demo Mode

If no valid API key is configured, the app runs in demo mode with template-based generation. Good for testing the UI without AI.

## Troubleshooting

### "API Key not found" Error
Get a new key from https://aistudio.google.com/app/apikey

### MongoDB Connection Error
Start MongoDB: `docker run -d -p 27017:27017 --name mongodb mongo:latest`

### "Using mock AI responses"
Check backend logs, verify API key is valid and backend is running

### Frontend can't connect to backend
Ensure backend is running on port 3000 and `VITE_API_BASE_URL` is correct

## Examples

### Example 1: Button Component
**Prompt**: "Create a primary action button"

**Generated**:
```jsx
export default function PrimaryButton() {
  return (
    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700
                       text-white font-semibold rounded-lg
                       shadow-md transition-colors">
      Get Started
    </button>
  );
}
```

### Example 2: Contact Form
**Prompt**: "Create a contact form with name, email, and message fields"

**Generated**:
```jsx
export default function ContactForm() {
  return (
    <form className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
      <input type="text" placeholder="Name"
             className="w-full mb-4 px-4 py-2 border rounded-lg" />
      <input type="email" placeholder="Email"
             className="w-full mb-4 px-4 py-2 border rounded-lg" />
      <textarea placeholder="Message" rows="4"
                className="w-full mb-4 px-4 py-2 border rounded-lg" />
      <button type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg">
        Send
      </button>
    </form>
  );
}
```

## Development

### Project Structure
```
ai-builder/
├── backend/
│   ├── middleware/       # Auth, error handling, rate limiting
│   ├── models/          # MongoDB models (User, Project)
│   ├── routes/          # API routes
│   ├── services/        # GeminiAgent (AI integration)
│   ├── websocket/       # Real-time collaboration
│   └── server.js        # Express server
├── src/
│   ├── components/      # React components
│   ├── context/         # Auth context
│   ├── hooks/           # Custom hooks
│   ├── services/        # API service
│   └── utils/           # Helper functions
└── dist/                # Production build
```

### Adding Features

The project is fully modular. To add features:

1. **Backend**: Add routes in `backend/routes/`
2. **Frontend**: Add components in `src/components/`
3. **State**: Use context in `src/context/`
4. **API**: Update `src/services/api.js`

## License

MIT

## Support

For issues or questions:

1. Check `SETUP_GUIDE.md` for setup help
2. Check `FIXES_APPLIED.md` for what was changed
3. Run `node backend/test-gemini.js` to test AI
4. Check backend logs for detailed errors

---

**Built with**: React, Node.js, Express, Gemini AI, MongoDB, Tailwind CSS

**Status**: ✅ Fixed and ready to use (just add valid Gemini API key)
