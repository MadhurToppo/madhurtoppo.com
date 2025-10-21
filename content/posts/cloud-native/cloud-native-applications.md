---
title: Cloud Native Applications
date: 2025-10-21T15:18:28+02:00
draft: false
cover:
  image: "/images/cloud-native.jpg"
  alt: "Cloud Native Applications Illustration"
  caption: "Building Cloud Native Applications with Spring Boot"
  relative: false
  hidden: false
tags:
  - cloud
  - microservices
  - kubernetes
categories:
  - cloud-native
---
## The 12 Factors — and Beyond

Building Cloud Native Applications with Spring Boot involves more than just
containerization and orchestration. It’s about designing software that thrives
in dynamic cloud environments — scalable, resilient, observable, and secure.

Let’s explore the 12 Factors and Beyond, adapted for modern Spring-based systems.
### 1. One Codebase, One Application
   Every application should have a single codebase tracked in version control (e.g., Git, 
   Subversion).
   
   ✅ Each environment (dev, staging, prod) deploys from the same source, not different branches. Keeping codebase in a common source (main) for all environments.
   
```shell
git init
git add .
git commit -m "initial commit"
git push origin main
```
   
   💡 Tip: Use Git branching strategies (GitFlow or Trunk-based development) for cleaner CI/CD pipelines.
### 2. API First

   Design APIs before implementing business logic. With an API-first approach,
   teams can develop independently while maintaining strong contracts between
   services. Spring tools like SpringDoc OpenAPI or Swagger can automatically
   generate API documentation and contracts.
   
```java
@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(new Customer(id, "Alice", "alice@example.com"));
    }
}
```

```xml
<!-- pom.xml -->
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>2.6.0</version>
</dependency>
```

Access API docs at: `http://localhost:8080/swagger-ui.html`
### 3. Dependency Management

   Declare and manage dependencies explicitly using a manifest file such as `pom.xml` (Maven) or `build.gradle` (Gradle).
   
```xml
<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

💡 Use a single build tool and lock dependency versions for reproducible builds.
### 4. Design, Build, Release, and Run

A Cloud Native app moves through four key stages:

**i. Design:** Decide tech stack, dependencies, and architecture.

```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
</dependencies>

```
   
**ii. Build:** Package source code and dependencies into an immutable artifact (JAR/Docker image).

```bash
mvn clean package
```

`Dockerfile`

```dockerfile
FROM eclipse-temurin:21-jdk
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

Then build the Docker image:
```bash
docker build -t cloudnative-app:1.0.0 .
```

**iii. Release:** Tag and push the release image with version info.
   
```bash
docker tag cloudnative-app:1.0.0 myrepo/cloudnative-app:1.0.0
docker push myrepo/cloudnative-app:1.0.0
```
You could store configuration separately in a `.env` or Kubernetes ConfigMap:

```bash
APP_ENV=prod
DB_URL=jdbc:postgresql://db:5432/demo
```

**iv. Run:** Run the released image in a controlled environment.

Local run:

```bash
docker run -d -p 8080:8080 --env-file .env myrepo/cloudnative-app:1.0.0
```

Kubernetes deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cloudnative-app
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: cloudnative-app
          image: myrepo/cloudnative-app:1.0.0
          envFrom:
            - configMapRef:
                name: app-config

```

💡 **CI/CD Integration:**  
Use tools like **GitHub Actions**, **Jenkins**, or **Argo CD** to automate these four stages — from building the Docker image to deploying it to your Kubernetes cluster.
   
### 5. Configuration, Credentials, and Code

Keep configuration and secrets outside the codebase — preferably in environment
variables or a config server. 

```properties
# application.properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASS}
```

Set them in your shell or Kubernetes Secret:

```bash
export DB_URL=jdbc:postgresql://db:5432/demo
export DB_USER=admin
export DB_PASS=secret
```

Or use **Spring Cloud Config** for centralized management.
### 6. Logs

Applications should write logs to stdout/stderr and not handle storage.

```java
@Slf4j
@RestController
public class LogController {

    @GetMapping("/process")
    public String process() {
        log.info("Processing request at {}", LocalDateTime.now());
        return "done";
    }
}
```

External systems (e.g., Loki, ELK Stack) aggregate, process, and visualize logs
for analysis. Combine with Spring Boot Actuator and Grafana Loki for structured
logging.

🧠 In Docker or Kubernetes, logs can be collected automatically via `kubectl logs` or Loki.
### 7. Disposability

Applications must be fast to start and graceful to shut down.

```properties
# application.properties
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=30s
```

```java
@EventListener(ContextClosedEvent.class)
public void onShutdown() {
    log.info("Cleaning up before shutdown...");
}
```

In failure scenarios, new instances should automatically spin up (resilience).
Docker and Kubernetes make disposability easy with readiness/liveness probes and
auto-scaling.

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
```
### 8. Backing Services

Treat databases, message brokers, caches, and APIs as attached resources —
easily replaceable without code changes.

Example: swapping MySQL for PostgreSQL or RabbitMQ for Kafka should not require
refactoring.

```java
@Service
public class MessageService {
    private final RabbitTemplate rabbitTemplate;
    public MessageService(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendMessage(String msg) {
        rabbitTemplate.convertAndSend("queue_name", msg);
    }
}
```
### 9. Environment Parity

Maintain minimal differences across development, staging, and production.
Bridging gaps ensures reliability:
   
- Time Gap: Faster deployment cycles.
- People Gap: Developers and Ops share ownership (DevOps).
- Tools Gap: Same tools and dependencies across environments.

Example: Use Docker Compose locally and Kubernetes in production with similar configurations.
   
```yaml
# docker-compose.yml
services:
  app:
    image: cloudnative-app
    environment:
      - SPRING_PROFILES_ACTIVE=dev
  db:
    image: postgres
```
### 10. Administrative Processes

Treat DB migrations, batch jobs, and cron tasks as one-off processes tracked in
the same codebase.

```bash
java -jar app.jar --spring.profiles.active=prod \
  --spring.flyway.enabled=true
```

Use Flyway or Liquibase for version-controlled schema migrations.

```sql
-- V1__create_table.sql
CREATE TABLE customer (id SERIAL PRIMARY KEY, name VARCHAR(50));
```
### 11. Port Binding

Applications should self-contain an embedded server and expose services via a
unique port.

In Spring Boot:
```properties
server.port=8080
```

The app becomes a service that can be consumed by others via port binding.	

Access at `http://localhost:8080`
### 12. Stateless Processes

Adopt a share-nothing architecture — state belongs in databases or caches, not
in-memory. This allows horizontal scaling without session loss. Use Spring
Session with Redis or Hazelcast for distributed session management.

```xml
<dependency>
  <groupId>org.springframework.session</groupId>
  <artifactId>spring-session-data-redis</artifactId>
</dependency>
```

```java
@EnableRedisHttpSession
public class SessionConfig { }
```
### 13. Concurrency

Achieve scalability by running multiple concurrent processes. Leverage JVM
thread pools, WebFlux reactive programming, or Kubernetes replicas. Example: Use
`@Async` in Spring or reactive pipelines with Project Reactor.

```java
@Async
public void processTask() {
    log.info("Processing in thread: {}", Thread.currentThread().getName());
}
```

```java
@EnableAsync
@SpringBootApplication
public class CloudNativeApp {}
```
### 14. Telemetry
Cloud Native apps must be observable — monitor metrics, logs, traces, and health.

```xml
<dependency>
  <groupId>io.micrometer</groupId>
  <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

**Tools:**
- Prometheus for metrics
- Grafana for visualization
- Loki for logs
- Tempo or Jaeger for tracing

Integrate with Spring Boot Actuator for /metrics, /health, and /prometheus endpoints.

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health, metrics, prometheus
```
### 15. Authentication & Authorization
Secure APIs and services using OAuth 2.0, OpenID Connect, or JWT tokens.

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

Use Spring Security or delegate to an API Gateway like Spring Cloud Gateway for centralized security enforcement.

```java
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/**").permitAll()
            .anyRequest().authenticated())
        .oauth2ResourceServer(OAuth2ResourceServerConfigurer::jwt)
        .build();
}
```

**🌩️ Beyond the 12 Factors**

Modern Cloud Native development goes further:
- Resilience: Circuit breakers, retries, and bulkheads via resilience4j. 
- Observability: Distributed tracing with Spring Cloud Sleuth or Micrometer Tracing. 
- GitOps: Declarative deployments with Argo CD. 
- Service Meshes: Secure and monitor network traffic with Istio or Linkerd.

Cloud Native Spring in Action is not just a checklist — it’s a mindset of automation, scalability, and resilience that drives how modern applications are built and operated.

---