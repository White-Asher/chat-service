# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Use Korean to communicate with users

## Project Overview

This is a Spring Boot-based real-time chat application backend with WebSocket support, OAuth2 authentication, and friend management features. The application uses MariaDB for persistence and follows a standard layered architecture.

**Tech Stack:** Spring Boot 3.4.5, Java 17, MariaDB, WebSocket/STOMP, Spring Security, JPA/Hibernate, Lombok, Gradle

## Essential Commands

### Build and Run
```bash
# Build the project
./gradlew build

# Run the application
./gradlew bootRun

# Clean build artifacts
./gradlew clean

# Build without tests
./gradlew build -x test
```

### Testing
```bash
# Run all tests
./gradlew test

# Run a specific test class
./gradlew test --tests com.chat.server.controller.UserControllerTest

# Run a specific test method
./gradlew test --tests com.chat.server.controller.UserControllerTest.testCreateUser

# Run tests with logging
./gradlew test --info
```

### Database Setup
The application expects a MariaDB instance running on `localhost:3307` with:
- Database: `chatdb`
- Username: `chat_user`
- Password: `chat_pwd`

JPA DDL mode is set to `update`, so schema changes are applied automatically on startup.

## Architecture

### Layer Structure
```
Controller Layer (REST/WebSocket endpoints)
    ↓
Service Layer (Business logic)
    ↓
Repository Layer (Data access)
    ↓
Domain Layer (Entities)
```

### Core Components

**Controllers:** REST API endpoints in `src/main/java/com/chat/server/controller/`
- `UserController` - User registration, login, profile management
- `FriendController` - Friend request workflow
- `ChatController` - Chat room and message operations
- `MessageController` - WebSocket message handling (STOMP)

**Services:** Business logic in `src/main/java/com/chat/server/service/`
- `UserService` - User account management, authentication with password encryption
- `FriendService` - Friend relationships with bidirectional storage (user1 < user2)
- `ChatService` - Chat rooms, messages, participant management with WebSocket notifications

**Domain Entities:** JPA entities in `src/main/java/com/chat/server/domain/`
- `UserBase` / `UserAuthBase` - User profile and authentication (1:1 relationship)
- `ChatRoom` / `ChatMessage` - Chat structure with soft delete on rooms
- `RoomParticipantsHistory` - Participation tracking with `quitAt` timestamp (null = active)
- `UserFriend` - Friend relationships with `FriendStatus` enum (PENDING/ACCEPTED)

### Key Architectural Patterns

**Soft Delete Pattern:**
- `ChatRoom.isActive` (Y/N) - preserves historical rooms
- `RoomParticipantsHistory.quitAt` (nullable timestamp) - tracks when users leave rooms
- Re-invitation is supported: previously quit users can rejoin by resetting `quitAt`

**Bidirectional Friend Relationships:**
Friend records normalize the relationship by storing the smaller user ID as `user1` and larger as `user2`. This prevents duplicate/conflicting records. Queries check both positions since relationships are undirected.

**WebSocket Integration:**
ChatService uses `SimpMessageSendingOperations` to broadcast JOIN/LEAVE system messages to `/topic/chat/room/{roomId}`. WebSocket endpoint is at `/ws/chat` with SockJS fallback.

**Transaction Management:**
Services use `@Transactional(readOnly = true)` as the default for all methods, with explicit `@Transactional` overrides on write operations for performance optimization.

**DTO Pattern:**
All entities have corresponding DTOs in `src/main/java/com/chat/server/dto/` with static factory methods like `fromEntity()` to convert between domain and API models.

**Exception Handling:**
Custom exceptions use `CustomException` with `ErrorCode` enum (in `src/main/java/com/chat/server/exception/`). Error codes follow prefixes: C (Common), U (User), F (Friend), CH (Chat).

### Configuration

**Security (`SecurityConfig.java`):**
- CORS allowed origin: `http://localhost:5173`
- Public endpoints: `/api/users/signup`, `/api/users/login`, `/api/users/me`, `/ws/**`
- All other endpoints require authentication
- Password encoding: BCrypt

**WebSocket (`WebSocketConfig.java`):**
- STOMP endpoint: `/ws/chat` with SockJS
- Message broker prefix: `/topic`
- Application destination prefix: `/app`

**Application Properties (`application.yml`):**
- Server port: 8081
- Session timeout: 60 minutes
- MariaDB connection on port 3307
- JWT secret configured (key: `jwt.secret`)
- SQL logging enabled with DEBUG level

## Common Development Patterns

### Adding a New Feature

1. **Define the domain entity** in `src/main/java/com/chat/server/domain/`
   - Use `@CreationTimestamp` and `@UpdateTimestamp` for audit fields
   - Apply `FetchType.LAZY` on all relationships
   - Add validation annotations (`@NotNull`, `@Size`, etc.)

2. **Create the repository interface** in `src/main/java/com/chat/server/repository/`
   - Extend `JpaRepository<Entity, IdType>`
   - Define custom query methods using Spring Data naming conventions

3. **Build the service** in `src/main/java/com/chat/server/service/`
   - Annotate class with `@Service` and `@Transactional(readOnly = true)`
   - Mark write operations with `@Transactional`
   - Use `Optional.orElseThrow(() -> new CustomException(ErrorCode.XXX))` pattern
   - Validate business rules before mutations

4. **Create DTOs** in `src/main/java/com/chat/server/dto/`
   - Add static factory method `fromEntity(Entity entity)`
   - Use nested classes for request/response variants

5. **Implement the controller** in `src/main/java/com/chat/server/controller/`
   - Use `@RestController` and `@RequestMapping`
   - Apply `@Valid` on request bodies
   - Return appropriate HTTP status codes

6. **Add error codes** to `ErrorCode` enum if new failure scenarios exist

7. **Write tests** in `src/test/java/com/chat/server/`
   - Repository tests: Use `@DataJpaTest` with H2 database
   - Controller tests: Use `@WebMvcTest` with `@WithMockCustomUser` for authentication
   - Follow existing test patterns in `UserControllerTest`, `FriendControllerTest`, etc.

### Testing Patterns

**Repository Tests:**
```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class MyRepositoryTest {
    // Uses H2 in-memory database
}
```

**Controller Tests with Mock Security:**
```java
@WebMvcTest(MyController.class)
class MyControllerTest {
    @WithMockCustomUser(userId = 1L, nickname = "testuser")
    @Test
    void testEndpoint() {
        // Custom annotation provides authenticated user context
    }
}
```

## Important Notes

- **Database:** The application uses MariaDB in production but H2 for tests (`testRuntimeOnly` dependency)
- **Monitoring:** Git history shows Grafana and Prometheus were added for monitoring (see parent directory)
- **Load Testing:** Git history mentions k6 load testing setup and scripts
- **Logging:** Root and Spring logging levels set to DEBUG for development
- **CORS:** Frontend is expected to run on `http://localhost:5173`
- **WebSocket:** Real-time features use STOMP over WebSocket with SockJS fallback
