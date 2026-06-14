# Estágio de Build (Compilação)
FROM eclipse-temurin:25-jdk-jammy AS build
COPY . .
# Usando o wrapper nativo do projeto com permissão de execução
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Estágio de Execução
FROM eclipse-temurin:25-jdk-jammy
COPY --from=build /target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]