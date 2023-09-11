# Pull in the official version of Node 14.
FROM node:14-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY yarn.lock ./

# Install production dependencies.
RUN yarn install --production

# Copy local codebase into the container image
COPY . ./

RUN npm uninstall puppeteer

RUN npm i puppeteer@19.4.1

# Start the api server
CMD [ "npm", "start" ]