# ==============================================================================
# EduPulse Spring Boot Multi-Tenant SaaS ERP - Production Backend Dockerfile
# Stage 1: Build stage with Maven & Eclipse Temurin Java 21 (Alpine)
# ==============================================================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Pre-cache Maven dependencies for faster reproducible builds
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy application source tree and package executable fat JAR (skipping tests)
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==============================================================================
# Stage 2: Minimal, Secure Runtime Image with Eclipse Temurin Java 21 Alpine
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine AS runtime

# Install curl for container health check probes and tzdata for accurate scheduling
RUN apk add --no-cache curl tzdata

# Security hardening: Create non-root unprivileged service account
RUN addgroup -g 1001 -S edupulse && \
    adduser -u 1001 -S edupulse -G edupulse

WORKDIR /app

# Ensure directories exist with proper non-root ownership
RUN mkdir -p /app /var/log/edupulse /var/lib/edupulse/uploads && \
    chown -R edupulse:edupulse /app /var/log/edupulse /var/lib/edupulse

# Copy compiled production JAR from builder stage with proper ownership
COPY --from=builder --chown=edupulse:edupulse /build/target/institutional-erp-backend-1.0.0-SNAPSHOT.jar /app/app.jar

# Enforce non-root execution
USER edupulse:edupulse

# Expose backend service port
EXPOSE 8081

# Production JVM container memory settings and entropy generation
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0 -Djava.security.egd=file:/dev/./urandom"

# Container health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8081/actuator/health || curl -f http://localhost:8081/api/health || exit 1

# Launch application via exec to properly propagate SIGTERM/SIGINT signals
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
