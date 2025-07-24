# Working Frontend Dockerfile - Development Mode with Proxy

FROM node:18

WORKDIR /usr/src/app/SpaceMatch

# Copy package files
COPY SpaceMatch/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY SpaceMatch/. .

# Expose port
EXPOSE 5173

# Start development server with host binding and proxy
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
