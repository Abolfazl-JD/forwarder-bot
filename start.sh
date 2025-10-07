
#!/bin/bash

# Exit immediately if any command fails
set -e

APP_NAME="telegram-broadcast-bot"

echo "🔧 Building the project..."
yarn build || npm run build

echo "🚀 Starting bot with PM2..."

# Stop previous instance (if running)
pm2 delete $APP_NAME || true

# Start the built bot using PM2
pm2 start dist/index.js --name $APP_NAME

# Save PM2 process list so it restarts after reboot
pm2 save

echo "✅ Bot started successfully and managed by PM2!"

