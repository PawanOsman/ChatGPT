# Use the official Node.js 14 Alpine image as the base image
FROM node:14-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the project files to the working directory
COPY . .

# Set environment variables from config.json
COPY config.js ./
RUN node -e "const config = require('./config.json'); process.env.OPENAI_API_KEY = config.openai.apiKey;"
# Add any other environment variable assignments if needed

# Expose a port (if your server is listening on a specific port)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
