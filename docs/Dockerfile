# Use the official Node.js 14 image from Docker Hub
FROM --platform=linux/amd64 node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies by copying
# package.json and package-lock.json
COPY package*.json ./

RUN npm install

# Bundle app source inside Docker image
COPY . .

# Your app binds to port 3000
EXPOSE 3000

# Define the command to run your app
CMD [ "node", "index.js" ]
