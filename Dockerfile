# Pull in the official version of Node 14.
FROM node:14

# Create and change to the app directory.
WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

# Install production dependencies.
RUN yarn install --production

# Copy local codebase into the container image
COPY . ./

# Start the api server
CMD [ "npm", "start" ]