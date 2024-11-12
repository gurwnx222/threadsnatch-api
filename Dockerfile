# Use Node.js 19 slim version as the base image
FROM node:19-slim

# Install Chromium and its dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libxcomposite1 \
    libxrandr2 \
    libnss3 \
    libx11-xcb1 \
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

# Set the CHROME_EXECUTABLE_PATH environment variable
ENV CHROME_EXECUTABLE_PATH=/usr/bin/chromium

# Run the application
CMD ["node", "index.js"]
