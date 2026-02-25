# AI Builder Backend API

This is a reference implementation for the AI Builder backend API using Express.js and OpenAI.

## Setup

1. **Install dependencies**
```bash
cd backend-example
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Add your OpenAI API key to .env
```

3. **Start the server**
```bash
npm run dev  # Development with nodemon
# or
npm start    # Production
```

## API Endpoints

### POST /api/generate
Generate UI component from natural language description.

**Request:**
```json
{
  "prompt": "Create a modern hero section",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:**
```json
{
  "code": "import React from 'react'...",
  "message": "Component generated successfully!",
  "preview": {
    "html": "..."
  }
}
```

### GET /api/projects
Get list of saved projects.

### POST /api/projects
Save a project.

## Using Alternative AI Providers

### Anthropic Claude
```javascript
const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await anthropic.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }],
});
```

### Google Gemini
```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const result = await model.generateContent(prompt);
```

### Local LLM (Ollama)
```javascript
const response = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  body: JSON.stringify({
    model: 'codellama',
    prompt: prompt,
  }),
});
```

## Deployment

### Deploy to Railway
1. Push to GitHub
2. Connect to Railway
3. Add environment variables
4. Deploy

### Deploy to Render
1. Create new Web Service
2. Connect repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

### Deploy to AWS Lambda (Serverless)
Use AWS Lambda with API Gateway for serverless deployment.
