# Use an official Node runtime as a parent image
FROM --platform=linux/amd64 node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any dependencies
RUN npm install
RUN npm install pm2 -g

# Bundle app source
COPY . .

# Make port available to the world outside this container
EXPOSE 3000

RUN npm run build

# Define command to run the app
CMD ["npm", "start"]
