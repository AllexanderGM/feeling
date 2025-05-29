# Etapa de construcción
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Etapa de producción
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/feeling-0.0.1-SNAPSHOT.jar app.jar
COPY /.env .env

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
