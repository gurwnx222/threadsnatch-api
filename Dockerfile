FROM ghcr.io/puppeteer/puppeteer:23.6.0

# Set environment variables correctly
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \  PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Switch to root to install system dependencies
USER root

# Install npm dependencies and Chrome in the same RUN command
RUN npm ci && \
    apt-get update && \
    apt-get install -y google-chrome-stable

# Copy the rest of the application code
COPY . .

# Expose port 8080
EXPOSE 8080

# Set the command to start the app
CMD ["node", "index.js"]
