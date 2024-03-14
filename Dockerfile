# Use the official Nginx image as the base image
FROM nginx:alpine

# Copy the nginx configuration file
COPY nginx.conf nginx.conf

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy the Angular build output to the nginx folder
COPY dist/smart-fhir /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Command to run nginx
CMD ["nginx", "-g", "daemon off;"]
