# Pull in the official version of Node.
FROM node:22-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

COPY package.json yarn.lock ./

# Install production dependencies.
RUN yarn install --production --frozen-lockfile && yarn cache clean

# Copy local codebase into the container image
COPY . .

# Start the api server
CMD [ "yarn", "start" ]