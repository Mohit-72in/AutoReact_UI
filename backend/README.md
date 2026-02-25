# AI Builder Backend

Production-ready backend for AI Builder with MongoDB, JWT authentication, and real-time collaboration.

## 🚀 Features

- **JWT Authentication** - Secure token-based auth with refresh tokens
- **MongoDB Database** - User and project data persistence
- **Real-time Collaboration** - WebSocket support for live coding
- **GitHub Export** - Export projects directly to GitHub repositories
- **AI Integration** - OpenAI GPT-4 for code generation
- **Rate Limiting** - Protection against abuse
- **Error Handling** - Comprehensive error management
- **Version Control** - Project versioning system

## 📦 Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure environment variables:

```env
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-builder

# JWT Secrets
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# OpenAI
OPENAI_API_KEY=sk-your-key-here
```

## 🏃 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## 🔧 MongoDB Setup

### Local MongoDB
```bash
# Install MongoDB
brew install mongodb-community  # macOS
sudo apt install mongodb        # Linux

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongodb            # Linux
```

### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Projects
- `GET /api/projects` - Get all user projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/collaborators` - Add collaborator
- `GET /api/projects/:id/versions` - Get versions

### AI
- `POST /api/ai/generate` - Generate code from prompt
- `POST /api/ai/improve` - Improve existing code
- `POST /api/ai/explain` - Explain code

### GitHub
- `POST /api/github/export/:projectId` - Export to GitHub
- `GET /api/github/user` - Get GitHub user info

## 🔌 WebSocket Events

### Client → Server
- `join-project` - Join project room
- `leave-project` - Leave project room
- `code-update` - Send code changes
- `cursor-move` - Send cursor position
- `chat-message` - Send chat message
- `typing-start` - Start typing indicator
- `typing-stop` - Stop typing indicator

### Server → Client
- `user-joined` - User joined project
- `user-left` - User left project
- `active-users` - List of active users
- `code-updated` - Code changed by another user
- `cursor-moved` - Cursor moved by another user
- `chat-message` - New chat message
- `user-typing` - User is typing

## 🚂 Railway Deployment

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize project:
```bash
railway init
```

4. Add MongoDB plugin:
```bash
railway add
# Select MongoDB
```

5. Set environment variables:
```bash
railway variables set JWT_SECRET=your-secret
railway variables set OPENAI_API_KEY=sk-your-key
```

6. Deploy:
```bash
railway up
```

## 📝 Database Models

### User
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  profile: {
    fullName: String,
    avatar: String,
    bio: String
  },
  settings: {
    theme: String,
    notifications: Boolean
  }
}
```

### Project
```javascript
{
  name: String,
  description: String,
  owner: ObjectId (User),
  collaborators: [{
    user: ObjectId (User),
    role: String
  }],
  code: {
    html: String,
    css: String,
    js: String,
    jsx: String
  },
  previewHTML: String,
  chatHistory: Array,
  versions: Array,
  githubRepo: Object
}
```

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on all routes
- Helmet.js security headers
- CORS configuration
- Input validation
- Error sanitization

## 🧪 Testing

```bash
# Coming soon
npm test
```

## 📄 License

MIT
