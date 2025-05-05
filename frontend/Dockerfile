# Etapa de build
FROM node:23-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa de producción
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
# Exponer el puerto del frontend
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
