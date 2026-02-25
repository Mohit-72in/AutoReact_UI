#!/bin/bash

echo "🚀 AI Builder - Quick Start"
echo "=========================="
echo ""

# Check if MongoDB is running
echo "📦 Checking MongoDB..."
if ! command -v mongod &> /dev/null && ! docker ps | grep -q mongodb; then
    echo "⚠️  MongoDB not detected. Starting with Docker..."
    docker run -d -p 27017:27017 --name mongodb mongo:latest
    echo "✅ MongoDB started"
else
    echo "✅ MongoDB is running"
fi

echo ""

# Check Gemini API key
if grep -q "AIzaSyB6DLxpEojGe-IHSfFMrJnX1HCz1hk254g" backend/.env; then
    echo "⚠️  WARNING: You're using an invalid API key!"
    echo "   Get a new one from: https://aistudio.google.com/app/apikey"
    echo "   See GET_API_KEY.md for instructions"
    echo ""
fi

# Start backend in background
echo "🔧 Starting backend..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Start frontend
echo "🎨 Starting frontend..."
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
