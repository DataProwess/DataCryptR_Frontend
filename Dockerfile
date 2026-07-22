# Stage 1: Build dependencies
FROM node:18-alpine AS builder
WORKDIR /app

# Copy only package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy the rest of the app code and build
COPY . .
ARG REACT_APP_API_URL
ARG REACT_APP_FRONTEND_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_FRONTEND_URL=$REACT_APP_FRONTEND_URL
RUN npm run build

# Stage 2: Copy application code and dependencies for production
FROM node:18-alpine AS final
WORKDIR /app

# Copy only package.json and install production dependencies
COPY --from=builder /app/package*.json ./
RUN npm install --production

# Copy build artifacts
COPY --from=builder /app/build ./build

# Expose the port the app will run on
EXPOSE 3000

# Command to serve the built app
CMD [ "npx", "serve", "-s", "build" ]
