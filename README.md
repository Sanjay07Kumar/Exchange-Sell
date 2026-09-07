# ExSell - Peer-to-Peer Exchange & Sell Marketplace
## Comprehensive Technical System Report (Ground Level to Extreme Architecture)

Welcome to the **ExSell** Technical System Report. This document serves as a complete, top-to-bottom master guide of the **ExSell** web application. It is designed to walk you through the absolute ground-level concepts, all the way to the advanced implementation details of every component, service, and database entity, preparing you thoroughly for your interview.

---

## ── Table of Contents ──
1. [High-Level Overview: What, Why & How](#1-high-level-overview-what-why--how)
2. [Full Technology Stack & Dependencies](#2-full-technology-stack--dependencies)
3. [Database Schema & Spring Data JPA Models](#3-database-schema--spring-data-jpa-models)
4. [Backend Architecture & Security Context](#4-backend-architecture--security-context)
5. [Rest API Endpoint Directory](#5-rest-api-endpoint-directory)
6. [Real-Time WebSocket Negotiation & Chat Engine](#6-real-time-websocket-negotiation--chat-engine)
7. [Frontend Architecture & Page Navigation Flow](#7-frontend-architecture--page-navigation-flow)
8. [Point-to-Point Method Walkthrough](#8-point-to-point-method-walkthrough)
9. [Interview Q&A Prep & System Design Justifications](#9-interview-qa-prep--system-design-justifications)

---

## 1. High-Level Overview: What, Why & How

### What is ExSell?
**ExSell** is a modern, responsive peer-to-peer (P2P) campus/local marketplace web application where authenticated users can list items they want to sell or exchange, browse categories, maintain wishlists, add items to a shopping cart, and engage in real-time, peer-to-peer price negotiations via instant messaging.

### Why does it exist?
Traditional e-commerce platforms do not facilitate two-way negotiations or direct item exchanges (trading product A for product B). **ExSell** bridges this gap by introducing:
*   **Negotiation-First Chat:** Buyers and sellers converse directly inside a room tied to a specific item.
*   **Flexible Transactions:** Support for both cash sales and bartering/exchange.
*   **Trust-Building Micro-Interactions:** Profiles showing user locations (City, State), listings, and real-time connectivity status.

### How does it work?
1.  **Identity:** A user registers and logs in, receiving a signed JWT (JSON Web Token) containing their identity.
2.  **Listing:** Sellers upload items by filling out a form and attaching product photos. Photos are uploaded dynamically to Cloudinary (retrieving secure HTTPS URLs), and item details are saved to a PostgreSQL database.
3.  **Discovery:** Buyers browse listings by category, perform text searches, or view item details.
4.  **Transaction/Negotiation:** Buyers can add items to their Cart/Wishlist or tap **"Chat with Seller"** or **"Negotiate Price"**. This establishes a dedicated WebSocket room for real-time conversation and image sharing.
5.  **Fulfillment:** The owner can mark items as `SOLD_OUT` to deactivate them from general search results or back to `ACTIVE` to relist them.

---

## 2. Full Technology Stack & Dependencies

### Backend (Spring Boot Framework)
*   **Language & Core Platform:** Java 17, Spring Boot 3.2.0 (configured with Maven `pom.xml`).
*   **Web API Routing:** Spring Web MVC (`@RestController`) for building RESTful endpoints.
*   **Real-time Communication:** Spring WebSocket (`spring-boot-starter-websocket`) utilizing raw WebSocket session handling for custom duplex messaging.
*   **Database Access Layer:** Spring Data JPA with Hibernate ORM (`spring-boot-starter-data-jpa`).
*   **Database Management System:** PostgreSQL (Production-ready relational database).
*   **Security & Encryption:** Spring Security + BCrypt password encoder + JWT (Java JSON Web Token library `jjwt` 0.11.5).
*   **Media Hosting:** Cloudinary SDK (`cloudinary-http44`) for high-speed cloud-based image storage.
*   **Boilerplate reduction:** Lombok annotations (`@Getter`, `@Setter`, `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`).
*   **Geospatial (Configured but inactive):** Hibernate Spatial (`6.4.4.Final`) + JTS Topology Suite Core (`jts-core` 1.19.0) for future location mapping.
*   **Legacy Storage Configuration:** MinIO configuration is present in `application.yml` and `pom.xml`, but has been refactored in favor of **Cloudinary** for image uploads.

### Frontend (React Single Page Application)
*   **Bundler & Runtime:** Vite 7.1.7 (Next-generation, ultra-fast frontend build tool).
*   **Core UI Library:** React 19.1.1 & React DOM 19.1.1 (Using JSX & Functional Hooks).
*   **Routing:** React Router DOM v7 (`react-router-dom` 7.9.4) for client-side navigation.
*   **Styling:** Tailwind CSS V3 (`3.4.18`) for modern utility-first layouts, responsive grids, and clean design metrics.
*   **HTTP Client:** Fetch API (Vanilla React) and Axios (`1.16.0`) for making requests to the backend server.
*   **UI Icons:** Lucide React (`0.555.0`) & React Icons (`5.5.0`).

---

## 3. Database Schema & Spring Data JPA Models

ExSell uses a clean relational database schema mapped via Spring Data JPA. Below are the key entities:

### A. User Entity (`users` table)
Represents a registered platform account.
*   `id` (Long, Primary Key, Auto-incremented)
*   `username` (String, Non-null)
*   `email` (String, Non-null, Unique check at service level)
*   `password` (String, Non-null, BCrypt Hash)
*   `phone` (String, Nullable)
*   `profilePhotoUrl` (String, Nullable)
*   `city` (String, Nullable)
*   `state` (String, Nullable)

### B. Category Entity (`categories` table)
Used to organize items in the catalog.
*   `id` (Long, Primary Key)
*   `name` (String, Unique, Non-null)
*   `categoryImg` (String, Nullable image URL)

### C. Item Entity (`items` table)
Represents a listing created by a seller.
*   `id` (Long, Primary Key)
*   `name` (String)
*   `description` (String)
*   `price` (Double)
*   `isNegotiable` (Boolean)
*   `imageUrls` (List of Strings, saved as an array of URLs)
*   `isAvailable` (Boolean)
*   `forExchange` (Boolean)
*   `itemAge` (String, e.g., "6 months")
*   `condition` (String, e.g., "Like New")
*   `status` (Enum: `ACTIVE`, `SOLD_OUT`)
*   `category` (ManyToOne mapping to Category)
*   `owner` (ManyToOne mapping to User, maps to database column `owner_id`)

### D. CartItem Entity (`cart_items` table)
Links a user to the items they intend to purchase.
*   `id` (Long, Primary Key)
*   `user` (ManyToOne, maps to `user_id`)
*   `item` (ManyToOne, maps to `item_id`)
*   `quantity` (Integer)

### E. Wishlist Entity (`wishlist` table)
Links a user to items they want to monitor.
*   `id` (Long, Primary Key)
*   `user` (ManyToOne, maps to `user_id`)
*   `item` (ManyToOne, maps to `item_id`)

### F. ChatRoom Entity (`chat_rooms` table)
A negotiation room linking a buyer, seller, and a specific item.
*   `id` (Long, Primary Key)
*   `item` (ManyToOne, links to the product being negotiated)
*   `buyer` (ManyToOne, links to the negotiating buyer)
*   `seller` (ManyToOne, links to the item owner)
*   `lastUpdated` (Long timestamp representing the last message or activity in the room)

### G. ChatMessage Entity (`chat_messages` table)
A message sent within a specific negotiation ChatRoom.
*   `id` (Long, Primary Key)
*   `chatRoom` (ManyToOne relationship linking to the ChatRoom)
*   `sender` (ManyToOne relationship linking to the sending User)
*   `text` (String, message contents)
*   `imageUrl` (String, optional shared image attachment)
*   `timestamp` (Long, Unix timestamp in milliseconds)
*   `type` (String, e.g., `"message"`, `"image"`, `"system"`)

---

## 4. Backend Architecture & Security Context

ExSell implements a structured multi-layer architecture:
`Controller Layer (REST Endpoints) ──> Service Layer (Business Logic) ──> Repository Layer (Database Access) ──> Database (PostgreSQL)`

```
  ┌────────────────────────────────────────────────────────┐
  │                   CLIENT (BROWSER)                     │
  └───────────────────────────┬────────────────────────────┘
                              │ HTTP Requests
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                 SPRING SECURITY FILTER                 │
  │  (Intercepts requests & decodes Authorization: Bearer) │
  └───────────────────────────┬────────────────────────────┘
                              │ AuthorizedContext
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                 CONTROLLER LAYER (API)                 │
  │   - UserController        - ItemController             │
  │   - CartController        - ChatController             │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                 SERVICE LAYER (LOGIC)                  │
  │   - UserService           - ItemService                │
  │   - ChatService           - Cloudinary Integration     │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                REPOSITORY LAYER (JPA)                  │
  │   - UserRepo              - ItemRepo                   │
  │   - ChatRoomRepo          - ChatMessageRepo            │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                 DATABASE (POSTGRESQL)                  │
  └────────────────────────────────────────────────────────┘
```

### Authentication Architecture (JWT Flow)
Authentication is stateless and managed via signed JSON Web Tokens (JWT).

1.  **Filter Registration (`JwtAuthFilter.java`):**
    *   Registers a custom filter extending `jakarta.servlet.Filter`.
    *   It intercepts all incoming requests *before* they reach the core controllers.
2.  **Token Processing:**
    *   Extracts the HTTP Header `Authorization`. If it starts with `"Bearer "`, it strips the prefix to isolate the raw JWT token.
    *   Calls `JwtUtil.extractUsername(token)` to verify the signature (signed using a custom HMACS-SHA key configured via `app.jwt.secret`) and extracts the user's registered email (which acts as the Security Principal username).
3.  **Security Context Injection:**
    *   If the token is valid, it retrieves the user details using `CustomUserDetailsService.java` and creates a `UsernamePasswordAuthenticationToken` payload.
    *   This payload is stored directly in Spring's core `SecurityContextHolder.getContext().setAuthentication(auth)`.
    *   Once injected, downstream controllers can use annotations like `@RequestHeader("Authorization")` or parameters like `Principal principal` to access authenticated user details securely.
4.  **Filter Chain Access Rules (`SecurityConfig.java`):**
    *   **Permit All (Public access):** Registration (`/user/register`), Login (`/user/login`), browsing items and categories (`GET /items/**`, `GET /categories/**`), public uploads (`GET /uploads/**`), and the WebSocket endpoint (`/ws/**`).
    *   **Authenticated Only (Protected access):** Modifying listings (adding, updating, deleting), editing user profiles, wishlist and cart operations, and loading active chat rooms or chat history.

---

## 5. Rest API Endpoint Directory

### Authentication & Users (`/user`)
*   `POST /user/register` - Creates a new user account. Encrypts the raw password using BCrypt before database persistence.
*   `POST /user/login` - Authenticates credentials. Generates and returns a signed JWT token along with the User ID.
*   `GET /user/profile/{id}` - Retrieves a user's profile details.
*   `PUT /user/update` - Modifies profile details (username, phone, city, state, profile photo, or password).
*   `DELETE /user/delete/{id}` - Deletes a user account. Validates that the requesting JWT belongs to the target user.

### Item Listings (`/items`)
*   `GET /items/all` - Retrieves all listed items on the platform.
*   `GET /items/others-items` - Retrieves active items listed by other users (filters out current user's listings).
*   `GET /items/{id}` - Retrieves complete details of a specific item.
*   `GET /items/category/name/{categoryName}` - Gets active items matching a category name.
*   `GET /items/category/{id}` - Gets active items matching a category ID.
*   `GET /items/my-items` - Retrieves all active and sold-out listings posted by the authenticated user.
*   `GET /items/my-sold-items` - Retrieves all sold-out listings posted by the authenticated user.
*   `POST /items/add-items` - Accepts multipart form data (text inputs + item images). Uploads images to Cloudinary and saves the item details with the generated URLs.
*   `PUT /items/update-item/{id}/owner/{ownerId}` - Modifies details of an existing item. Validates that the requester is the item owner.
*   `DELETE /items/delete-item/{id}/owner/{ownerId}` - Removes an item listing.
*   `PUT /items/mark-sold/{id}` - Marks an item as sold out (`ItemStatus.SOLD_OUT`).
*   `PUT /items/mark-active/{id}` - Marks an item back as active (`ItemStatus.ACTIVE`).

### Wishlist Management (`/wishlist`)
*   `POST /wishlist` - Adds a target item to a user's wishlist.
*   `GET /wishlist/user/{userId}` - Retrieves all wishlist items for a given user.
*   `DELETE /wishlist/{wishlistId}` - Removes a specific item from the user's wishlist.

### Cart Management (`/cart`)
*   `POST /cart/add` - Adds an item to the shopping cart.
*   `GET /cart` - Retrieves the active shopping cart contents for the authenticated user.
*   `DELETE /cart/{cartId}` - Removes a specific item from the cart.

### Chat & Negotiation REST APIs (`/chat`)
*   `POST /chat/rooms/item/{itemId}` - Instantiates or retrieves a negotiation chat room between the logged-in buyer and the item owner.
*   `GET /chat/rooms` - Returns all active conversations (chat rooms) for the authenticated user.
*   `GET /chat/rooms/{roomId}` - Validates user membership and retrieves the item ID associated with the room.
*   `GET /chat/rooms/{roomId}/messages` - Retrieves historical messages for the chat room.
*   `POST /chat/rooms/{roomId}/upload-image` - Uploads a chat attachment image to Cloudinary and returns the hosted URL.

---

## 6. Real-Time WebSocket Negotiation & Chat Engine

The negotiation chat engine enables immediate communication and custom pricing offers between buyers and sellers. It is built as a stateful WebSocket endpoint.

```
       Buyer (Client)                       WebSocketHandler                      Seller (Client)
             │                                     │                                     │
             │ Connect ws://...&roomId=10&token=...│                                     │
             ├────────────────────────────────────>│                                     │
             │                                     │ Verify JWT Token                    │
             │                                     │ Resolve Role (Buyer / Owner)        │
             │                                     │ Join Session Group "chat-room-10"   │
             │                                     │                                     │
             │                                     │   Connect ws://...                  │
             │                                     │<────────────────────────────────────┤
             │                                     │   Verify JWT Token                  │
             │                                     │   Join Session Group "chat-room-10" │
             │                                     │                                     │
             │ Send: {"text": "Is price flexible?"}│                                     │
             ├────────────────────────────────────>│                                     │
             │                                     │ Save Msg to DB (ChatService)        │
             │                                     │ Broadcast payload to room members   │
             │                                     │────────────────────────────────────>│
             │                                     │                                     │
```

### A. WebSocket Configuration (`NegotiationWebSocketConfig.java`)
Registers a custom handler `NegotiationSocketHandler` under the `/ws/chat` endpoint, allowing WebSocket connections from any origin (`*`).

### B. Socket Negotiation & Connection (`NegotiationSocketHandler.java`)
*   **Connection Setup (`afterConnectionEstablished`):**
    1.  The client connects using the URL: `ws://localhost:8080/ws/chat?roomId={roomId}&token={token}`.
    2.  The handler extracts the query parameters. If `token` or `roomId` is missing, the connection is rejected.
    3.  The JWT token is validated, and the user's email is extracted using `jwtUtil.extractUsername(token)`.
    4.  It checks the database to verify the `ChatRoom` exists.
    5.  It resolves the user's role: if the user ID matches the item owner's ID, the role is set to `"owner"`; otherwise, it defaults to `"buyer"`.
    6.  The session is stored in an in-memory thread-safe `ConcurrentHashMap` group mapped to `"chat-room-" + roomId`.
*   **Handling Messages (`handleTextMessage`):**
    1.  When a text message is received, the handler parses the JSON payload (which can contain text, image attachments, or custom negotiation tags).
    2.  It delegates saving the message to `ChatService.saveMessage(...)` to ensure chat history is persisted in the PostgreSQL database.
    3.  It wraps the message in a `NegotiationMessage` data transfer object containing the item ID, sender email, resolved sender role (`"owner"` or `"buyer"`), message content, image URL, and a system timestamp.
    4.  It broadcasts the message payload as a text frame to all active WebSocket sessions currently inside the room.
*   **Connection Teardown (`afterConnectionClosed`):**
    *   Strips the closed session from memory structures (`roomSessions`, `sessionRoom`, `sessionSenderEmail`, etc.) to prevent memory leaks.

---

## 7. Frontend Architecture & Page Navigation Flow

The frontend client is structured as a single-page application (SPA) with a top-pinned navigation bar (`Navbar.jsx`) that checks authentication states reactively.

### Routing Infrastructure (`App.jsx`)
*   `/` -> `MainPage.jsx`: Displays item categories and recent active product listings.
*   `/login` & `/register` -> `Login.jsx` & `Register.jsx`: Pages handling user onboarding and credentials.
*   `/items/:id` -> `ItemDetails.jsx`: Detailed display of a selected item showing specifications, images, similar products, and actions (Wishlist, Add to Cart, Chat/Negotiate).
*   `/items/category/:id` -> `CategoryPage.jsx`: Displays items filtered by a chosen category ID.
*   `/addItem` -> `AddItem.jsx`: Form page for adding listings. Handles multiple image selection and uploads them using multipart requests.
*   `/profile` -> `Profile.jsx`: User profile settings showing personal details, list of uploaded items (active/sold-out), and a wishlist tab.
*   `/cart` -> `Cart.jsx`: Shopping cart view allowing item removal.
*   `/search` -> `Search.jsx`: Displays search results based on query terms.
*   `/chat` -> `Messages.jsx`: Listing of all active chat rooms the user is participating in (showing other user details, last message, and updated time).
*   `/chat/room/:roomId` -> `ChatPage.jsx`: Active chat interface.

### WebSocket Integration in `ChatPage.jsx`
1.  **Handshake Initialization:**
    Using standard WebSockets via a React `useEffect` hook:
    ```javascript
    const wsUrl = `ws://localhost:8080/ws/chat?roomId=${roomId}&token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    ```
2.  **Message Streaming:**
    *   **Receiving:** `ws.onmessage` listens for text payloads, parses the JSON string, and appends it to the functional state array `messages` to dynamically update the UI list.
    *   **Sending:** `handleSend()` serializes message payloads as JSON strings and pushes them over the socket connection using `wsRef.current.send(JSON.stringify({ text: newMessage }))`.
3.  **Media Upload in Chat:**
    *   Users can attach images using a hidden input.
    *   The file is sent to the backend `/chat/rooms/{roomId}/upload-image` endpoint using a multipart form request, uploading the image to Cloudinary.
    *   The returned secure URL is immediately transmitted via the active WebSocket connection with a type of `"image"` to render the attachment directly in the chat window.

---

## 8. Point-to-Point Method Walkthrough

Here is an explanation of the core business logic methods in the codebase:

### A. Authentication & Security Methods
1.  **`JwtUtil.generateToken(String username)`**:
    Generates a JWT token using HS256 algorithm. The token subject is set to the user's email, and its expiration is set to 24 hours.
2.  **`JwtUtil.extractUsername(String token)`**:
    Parses the token using the HMAC signing key to extract the token subject (the user's email).
3.  **`JwtAuthFilter.doFilter(...)`**:
    Intercepts incoming requests, extracts the JWT token from the `Authorization` header, validates the token, and configures the `SecurityContext` if validation succeeds.

### B. Listing & Media Management Methods
1.  **`ItemService.saveUploadedFiles(List<MultipartFile> files)`**:
    Takes a collection of file uploads and loops through them. It uploads each file to Cloudinary using `cloudinary.uploader().upload(...)` and extracts the hosted URL (`secure_url`). It returns the list of URLs to be saved in the database.
2.  **`ItemService.addItem(ItemRequestDTO dto, User owner)`**:
    Validates that the selected category ID exists. It creates a new `Item` instance, copies metadata from the request DTO (name, price, condition, age, exchange flags, and Cloudinary image URLs), sets the owner to the currently logged-in user, and saves the item.
3.  **`ItemService.getAllItemsExceptOwner(Long ownerId)`**:
    Retrieves all active items (`ItemStatus.ACTIVE`) except those posted by the specified user ID. This is used to display listings from other sellers on the homepage.
4.  **`ItemService.markItemAsSoldOut(Long itemId, Long ownerId)`**:
    Retrieves the item from the database, verifies that the requesting user matches the item owner's ID, updates the status field to `SOLD_OUT`, and saves the change. This hides the listing from general category pages.

### C. Chat & Negotiation Methods
1.  **`ChatService.getOrCreateRoom(Long itemId, Long buyerId)`**:
    Checks if a chat room already exists for the specified item and buyer. If not, it creates a new `ChatRoom` entity, setting the item, buyer, and seller (item owner). It throws an exception if the owner tries to start a room with their own listing.
2.  **`ChatService.getUserChatRooms(Long userId)`**:
    Retrieves all chat rooms where the user is either the buyer or the seller. For each room, it resolves who the *other* party is to fetch their username and profile photo, retrieves the last non-system message, and returns a formatted list sorted by activity.
3.  **`ChatService.saveMessage(...)`**:
    Persists a new message in the database. It links the message to the corresponding `ChatRoom` and `User` (sender), updates the room's `lastUpdated` timestamp, and saves the message.

---

## 9. Interview Q&A Prep & System Design Justifications

Use these points to explain the architectural decisions behind **ExSell**:

### Q1: Why did you use JWT instead of standard Spring Session cookies?
> **Answer:** "JWT provides a stateless authentication system. The backend doesn't need to look up session information in database memory for every API call. Once the client logs in, they store the token in local storage and attach it to the `Authorization` header of each request. The backend validates the signature cryptographically using `JwtUtil`. This keeps the backend stateless, making it easier to scale across multiple servers if needed."

### Q2: Why did you choose raw WebSockets over polling or libraries like Socket.io/STOMP?
> **Answer:** "For real-time negotiations, low latency is critical. Long-polling creates a lot of overhead with repeated HTTP requests. Raw WebSockets (`TextWebSocketHandler`) establish a persistent TCP connection between the client and the server. This allows messages to be sent instantly in both directions. We chose a raw WebSocket implementation combined with a query parameter handshake rather than STOMP to keep the messaging layer lightweight, highly customizable, and easy to run without requiring a separate message broker like RabbitMQ."

### Q3: Why is Cloudinary used instead of storing uploads on the local server?
> **Answer:** "Storing files on the local filesystem doesn't scale well. If the application is deployed to containerized or cloud environments (like AWS or Heroku), local storage is temporary, and files are lost when the instance restarts. Using Cloudinary provides a reliable external cloud storage solution. Images are uploaded, optimized, and served via a Content Delivery Network (CDN) for fast loading times."

### Q4: How are transactions and listings protected from unauthorized access?
> **Answer:** "Security is enforced at both the filter level and the service level. Spring Security handles endpoint-level access (for example, blocking unauthenticated users from creating listings). The service layer handles resource ownership checks. For instance, when updating or deleting a listing, `ItemService` verifies that the `ownerId` of the item matches the ID of the authenticated user before applying the change. Similarly, `ChatService` ensures that only the registered buyer or seller of a room can view its messages."

### Q5: How does the application handle real-time user roles in chat?
> **Answer:** "When a WebSocket connection is established, the handler extracts the JWT token from the query parameters, decodes it, and retrieves the user details. It then checks the database to see if the user is the item owner. In `NegotiationSocketHandler`, the sender's role is set to `"owner"` if they own the item, and `"buyer"` if they do not. This role is attached to every message payload sent to the clients, allowing the frontend to render appropriate styling (like 'Seller' or 'Buyer' tags) securely."
