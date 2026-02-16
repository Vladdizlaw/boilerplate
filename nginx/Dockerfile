# Step 2: Set up the production environment
FROM nginx:stable-alpine
RUN mkdir /etc/nginx/templates
COPY templates/default.conf.template /etc/nginx/templates
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]