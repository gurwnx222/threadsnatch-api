FROM ghcr.io/puppeteer/puppeteer:23.6.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \ PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

WORKDIR /usr/src/app

COPY package*.json ./

USER root

RUN npm ci
    && apt-get install google-   chrome-stable -y

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]