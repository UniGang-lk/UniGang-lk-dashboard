FROM node:20-alpine AS build

WORKDIR /app

# Copy root configurations
COPY package*.json ./
COPY turbo.json ./

# Copy Dashboard specific files
COPY Dashboard/package.json ./Dashboard/

# Install dependencies
RUN npm install

# Copy source
COPY Dashboard ./Dashboard

# Build the dashboard
WORKDIR /app/Dashboard
RUN npm run build

# Serve with nginx
FROM nginx:alpine
COPY --from=build /app/Dashboard/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
