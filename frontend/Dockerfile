# build stage

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# serve stage

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
# Copy the built React app files from the 'build' stage to Nginx's serving directory
COPY --from=build /app/dist /usr/share/nginx/html
# Expose port 80 (default Nginx port)
EXPOSE 80
# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]