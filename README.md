# 🤖 AI Builder UI - GenAI-Powered React Application

<div align="center">

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)

**Transform natural language into production-ready React components with AI**

[Getting Started](#-quick-start) • [Features](#-features) • [Tech Stack](#-tech-stack)

</div>

---

## 🎯 Overview

AI Builder UI is a modern web application that leverages GenAI to convert natural language descriptions into production-ready React components. Simply describe what you want to build, and watch as the AI generates beautiful, responsive, and accessible UI code.

### Key Capabilities

✨ **AI-Powered Generation** - Natural language to React components  
💬 **Conversational Interface** - Chat-based design workflow  
📱 **Responsive Preview** - Desktop, tablet, and mobile viewports  
💻 **Code Export** - Copy and use generated code instantly  
🎨 **Modern UI** - Beautiful interface with smooth animations  
🔐 **User Authentication** - Save and manage your projects  

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)
- OpenAI API key (optional for development)

### Installation

1. **Install Frontend Dependencies**
```bash
npm install
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Configure Environment**

Create `backend/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
OPENAI_API_KEY=your_openai_api_key  # Optional - works without it
```

4. **Start Development Servers**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

5. **Open Browser**: `http://localhost:5173`

---

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite 5** - Lightning-fast build tool
- **Tailwind CSS 3** - Utility-first CSS
- **Framer Motion** - Smooth animations

### Backend
- **Node.js + Express** - Server framework
- **MongoDB Atlas** - Cloud database
- **JWT** - Authentication
- **OpenAI API** - AI code generation
- **Socket.IO** - Real-time features

---

## 📁 Project Structure

```
ai-builder-ui/
├── src/                    # Frontend code
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── services/           # API integration
│   └── context/            # State management
│
├── backend/                # Backend code
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth, rate limiting
│   └── server.js           # Entry point
```

---

## 🐛 Troubleshooting

### Chatbot Not Working

**Solution**: The app works in **development mode** without an OpenAI API key! It automatically uses mock responses. To enable real AI, add your OpenAI API key to `backend/.env`.

### Port Already in Use

```bash
npx kill-port 5173  # Frontend
npx kill-port 3000  # Backend
```

### MongoDB Connection Error

- Check MongoDB URI is correct
- Whitelist your IP in MongoDB Atlas
- Verify network connectivity

---

## 📚 Documentation

- [Quick Start Guide](QUICKSTART.md) - Detailed setup instructions
- See `backend/README.md` for backend API documentation

---

## 🙏 Acknowledgments

Built with React, Node.js, MongoDB, and OpenAI

---

<div align="center">

**Made with ❤️**

</div>
