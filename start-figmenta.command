#!/bin/bash
echo "🚀 Starting Figmenta Discord Copilot System..."
echo "---------------------------------------------"

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Start Admin Dashboard in background
echo "1️⃣  Starting Admin Dashboard (Next.js)..."
npm run dev > /dev/null 2>&1 &
ADMIN_PID=$!
echo "   ✅ Admin Dashboard running at http://localhost:3000"

# Start Discord Bot in background
echo "2️⃣  Starting Discord Bot..."
cd discord-bot
npm install --silent
npm start &
BOT_PID=$!

echo "---------------------------------------------"
echo "✅ SYSTEM IS LIVE!"
echo "   - Admin Panel: http://localhost:3000"
echo "   - Discord Bot: Online"
echo ""
echo "📝 PRESS CTRL+C TO STOP EVERYTHING"
echo "---------------------------------------------"

# Wait for user input to kill processes
trap "kill $ADMIN_PID $BOT_PID; exit" INT
wait
