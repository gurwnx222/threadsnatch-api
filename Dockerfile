FROM ghcr.io/puppeteer/puppeteer:23.8.0

# Set environment variables correctly
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Set up working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Expose the application port
EXPOSE 8080

# Run the application
CMD ["node", "index.js"]
