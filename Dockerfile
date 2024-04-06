# Use the official Node.js 18 image as the base image
FROM node:18

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install
ENV HOST=0.0.0.0
ENV NODE_ENV=Production

# Copy the rest of the application code to the container
COPY . .

# Expose port 3000 for the application
EXPOSE 8080

# Start the application
ENTRYPOINT ["npm", "start"]