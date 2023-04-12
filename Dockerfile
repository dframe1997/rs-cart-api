# Use Node 18 as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json ONLY at first
COPY package*.json ./

# Install dependencies
RUN npm install

# Then copy the rest of the application code (this is an optimisation)

COPY . .

# Build the application
RUN npm run build

# Setting a user instead of giving the commands root access
USER node

# Expose port 8080
ENV PORT=8080
EXPOSE 8080

# Start the application
CMD ["node", "dist/main.js"]