#!/bin/bash

# Parameters
HOST=$1
USER=$2
APP_DIR=$3
REPO_URL=$4
DATABASE_URI=$5
DATABASE_NAME=$6
DATABASE_PASSWORD=$7
PORT=$8

echo "Starting deployment process..."

# Ensure the application directory exists
if [ ! -d "$APP_DIR" ]; then
  echo "Creating application directory..."
  mkdir -p $APP_DIR
fi

# Navigate to the application directory
if [ ! -d "$APP_DIR/.git" ]; then
  echo "Cloning repository..."
  git clone $REPO_URL $APP_DIR
else
  echo "Repository exists. Pulling latest changes..."
  cd $APP_DIR || exit
  git checkout dev/env
  git pull origin dev/env
fi

# Navigate to the application directory
cd $APP_DIR || exit

# Update or create the .env file with environment variables
rm -f .env
echo "Updating environment variables..."
{
  echo "DATABASE_URI=${DATABASE_URI}"
  echo "DATABASE_NAME=${DATABASE_NAME}"
  echo "DATABASE_PASSWORD=${DATABASE_PASSWORD}"
  echo "PORT=${PORT}"
} >> .env

# Install dependencies (example for Node.js)
echo "Installing dependencies..."
if ! npm install; then
  echo "Error installing dependencies. Exiting."
  exit 1
fi

# Start or restart the application using PM2
echo "Starting or restarting the application..."
if ! pm2 start server.js || pm2 restart all; then
  echo "Error starting application with PM2. Exiting."
  exit 1
fi

echo "Deployment completed successfully."
