FROM node:19.1.0

RUN apt-get update && apt-get install -y gnupg wget && \
    wget -q -O- https://dl-ssl.google.com/linux/linux_signing_key.pub | \
    gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install -y google-chrome-stable --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

USER root

RUN npm ci

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]