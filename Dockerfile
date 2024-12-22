# Use Node.js 19 slim version as the base image
FROM node:19-slim

# Install Chromium and its dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Increase /dev/shm size to avoid slow scraping
RUN mount -t tmpfs -o size=256m tmpfs /dev/shm

# Set the Chromium executable path as an environment variable
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set up working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose the application port
EXPOSE 8000

# Run the application
CMD ["node", "index.js"]