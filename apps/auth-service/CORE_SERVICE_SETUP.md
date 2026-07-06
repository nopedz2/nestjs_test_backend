# CORE_SERVICE Configuration Guide

## Giới thiệu

`CORE_SERVICE` là microservice lõi trong hệ thống cung cấp các chức năng:
- Quản lý tenant (khách hàng)
- Quản lý người dùng trên từng tenant
- Quản lý quyền và vai trò
- Quản lý phiên làm việc

## Cấu hình Biến Môi Trường

### File `.env` (hoặc `.env.development`)

```env
# Core Service - TCP Transport Configuration
CORE_SERVICE_HOST=127.0.0.1
CORE_SERVICE_PORT=4000

# Keycloak Configuration (nếu dùng external token exchange)
KEYCLOAK_ISSUER=https://keycloak.example.com/realms/your-realm

# Auth Service Secret (cho endpoint nội bộ)
AUTH_INTERNAL_SECRET=your-secret-key-here

# MongoDB
MONGO_URI=mongodb://localhost:27017/auth_service

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
```

## Message Patterns

### 1. **FIND_USER_BY_EMAIL**
Tìm user theo email

**Request:**
```json
{
  "email": "admin@company.com"
}
```

**Response:**
```json
{
  "id": "user_123",
  "name": "User Name",
  "email": "admin@company.com",
  "isActive": true
}
```

**Usage:**
```typescript
await this.authsService.findUserByEmail('admin@company.com');
```

---

### 2. **FIND_USER**
Tìm user theo tenant ID và điều kiện (email/username/id)

**Request:**
```json
{
  "tenantId": "tenant_123",
  "email": "user@company.com"
}
```

**Response:**
```json
{
  "id": "user_456",
  "tenantId": "tenant_123",
  "email": "user@company.com",
  "username": "john.doe",
  "roles": ["USER", "MANAGER"],
  "permissions": ["read", "write"]
}
```

**Usage:**
```typescript
const user = await this.authsService.findUser('tenant_123', {
  email: 'user@company.com'
});
```

---

### 3. **CHECK_USER_PERMISSION**
Kiểm tra quyền của user

**Request:**
```json
{
  "tenantId": "tenant_123",
  "userId": "user_456",
  "permission": "write",
  "resource": "documents"
}
```

**Response:**
```json
{
  "hasPermission": true
}
```

**Usage:**
```typescript
const canWrite = await this.authsService.checkUserPermission(
  'tenant_123',
  'user_456',
  'write'
);
```

---

### 4. **INVALIDATE_SESSION**
Vô hiệu hóa phiên làm việc (logout)

**Request:**
```json
{
  "tenantId": "tenant_123",
  "userId": "user_456",
  "sessionId": "session_789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session invalidated"
}
```

**Usage (Tự động gọi trong logout):**
```typescript
await this.authsService.invalidateSession('tenant_123', 'user_456');
```

---

## Cách Chạy CORE_SERVICE Locally

### 1. Nếu chưa có CORE_SERVICE

Auth Service sẽ chạy ở **standalone mode** với fallback:
- `findUserByEmail()` → trả `null`
- `findUser()` → dùng local user repository
- `checkUserPermission()` → trả `false`
- `invalidateSession()` → trả `false` (nhưng không crash)

```bash
npm run start:dev:auth
```

### 2. Nếu có CORE_SERVICE (TCP)

Đảm bảo CORE_SERVICE đang chạy trên port 4000:

```bash
# Terminal 1: Core Service
cd ../core-service
npm run start

# Terminal 2: Auth Service
npm run start:dev:auth
```

### 3. Docker Compose

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: auth_service

  core-service:
    build: ./apps/core-service
    ports:
      - "4000:4000"
    environment:
      MONGO_URI: mongodb://mongo:27017/core_service
      PORT: 4000
    depends_on:
      - mongo

  auth-service:
    build: ./apps/auth-service
    ports:
      - "3001:3001"
    environment:
      MONGO_URI: mongodb://mongo:27017/auth_service
      CORE_SERVICE_HOST: core-service
      CORE_SERVICE_PORT: 4000
      PORT: 3001
      JWT_SECRET: dev-secret
      AUTH_INTERNAL_SECRET: dev-internal-secret
    depends_on:
      - mongo
      - core-service
```

Run:
```bash
docker-compose up -d
```

---

## Testing Message Patterns

### Test với cURL

```bash
# Test Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Test Exchange External Token (Keycloak)
curl -X POST http://localhost:3001/auth/exchange-token \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant_123",
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'

# Test Internal User Token (chỉ từ service khác)
curl -X POST http://localhost:3001/auth/user-token \
  -H "x-internal-auth: dev-internal-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant_123",
    "userId": "user_456",
    "email": "user@company.com"
  }'

# Test Refresh Token
curl -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'

# Test Logout
curl -X POST http://localhost:3001/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'

# Test Profile (Protected)
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Tổng kết

| Pattern | Tác dụng | Fallback |
|---------|---------|----------|
| `FIND_TENANT_BY_EMAIL` | Tìm tenant | Trả `null` |
| `FIND_USER` | Tìm user | Dùng local repo |
| `CHECK_USER_PERMISSION` | Kiểm tra quyền | Trả `false` |
| `INVALIDATE_SESSION` | Logout từ service | Bỏ qua nếu không có |

Auth Service hoạt động **độc lập** nếu không có CORE_SERVICE.
