# Set base image
FROM node:18-alpine

# Set environment variables
ENV NODE_ENV=production
ENV SERVER_PORT=3000
ENV DEBUG=false
ENV MODERATION=true
ENV PRIOD=15000
ENV RATE_LIMIT=50
ENV WHITELISTED_IPS=[]

# Set OpenAI API keys
ENV OPENAI_KEYS="[ \
    \"sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\", \
    \"sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\", \
    \"sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\", \
    \"sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\" \
]"

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose ports
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
