# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open Browser
Navigate to: `http://localhost:5173`

---

## 📖 How to Use

### 1. **Start a Conversation**
Type a UI description in the chat:
```
Example: "Create a modern hero section with a gradient background"
```

### 2. **View Generated Design**
- See real-time preview in the preview panel
- Switch between Desktop/Tablet/Mobile views

### 3. **View Code**
- Click "View Code" button
- Copy generated React code
- Use in your projects

### 4. **Save Project**
- Click "New Project" to save current work
- Projects saved to localStorage automatically

---

## 🎨 Example Prompts to Try

```
1. "Create a modern pricing card with 3 tiers"
2. "Build a responsive navigation bar with dropdown"
3. "Design a feature section with icons and descriptions"
4. "Make a contact form with validation"
5. "Create a testimonial slider component"
```

---

## 🔧 Customization

### Change Theme Colors
Edit `src/index.css`:
```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Blue */
}
```

### Modify API Endpoint
Edit `.env`:
```
VITE_API_BASE_URL=https://your-backend.com/api
VITE_USE_MOCK_API=false
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3000
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Styling Issues
```bash
# Rebuild Tailwind
npm run build
```

---

## 📚 Next Steps

1. **Read Full Documentation**: `PROJECT_GUIDE.md`
2. **Setup Backend**: See `backend-example/README.md`
3. **Interview Prep**: Read `INTERVIEW_GUIDE.md`
4. **Run Tests**: `npm test`

---

## 💡 Tips

- **Mock API is enabled by default** - No backend needed for testing
- **Projects save automatically** - Check browser localStorage
- **Responsive by default** - Test on different screen sizes
- **Error handling included** - View console for debugging

---

**Need Help?** Check the documentation or open an issue!
