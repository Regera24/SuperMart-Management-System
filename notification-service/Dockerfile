# ── Stage 1: Build ──────────────────────────────────────
FROM maven:3.9.16-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:resolve -q 2>/dev/null || true
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn package -DskipTests -q

# ── Extract layered jar ──────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS extractor
WORKDIR /workspace
COPY --from=builder /workspace/target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# ── Stage 2: Runtime ─────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
RUN apk add --no-cache curl
COPY --chown=appuser:appgroup --from=extractor /workspace/dependencies/ ./
COPY --chown=appuser:appgroup --from=extractor /workspace/spring-boot-loader/ ./
COPY --chown=appuser:appgroup --from=extractor /workspace/snapshot-dependencies/ ./
COPY --chown=appuser:appgroup --from=extractor /workspace/application/ ./
USER appuser
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"
EXPOSE 8087
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8087/actuator/health || exit 1
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
