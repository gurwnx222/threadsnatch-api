# Use Node.js 19 slim version as the base image
FROM node:19-slim

# Set environment variables to skip Puppeteer's default Chromium download
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install dependencies for Chromium (including fonts and libraries)
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libxcomposite1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose the application port
EXPOSE 8080

# Run the application
CMD ["node", "index.js"]