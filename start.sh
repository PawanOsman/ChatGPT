#!/bin/sh

if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
fi

clear
echo "Starting the application..."
npm start
