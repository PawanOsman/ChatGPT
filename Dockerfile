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

# Set environment variables from config.js
COPY config.js .

# Update OpenAI API key in the config.js file
RUN sed -i 's/your_openai_key/$OPENAI_API_KEY/' config.js

# Expose a port (if your server is listening on a specific port)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
