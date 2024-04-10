# Use a Node.js base image
FROM node:19

# Set the working directory
WORKDIR /app

# Clone the project repository
RUN git clone https://github.com/ztjhz/BetterChatGPT.git /app

# Install dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 5173

# Command to run the start script
CMD ["npm", "run", "dev"]
