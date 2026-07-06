# Auth Service - Pattern Implementation Summary (Simplified)

## ✅ Implementation Complete

Đã refactor auth service theo cấu trúc đơn giản mà bạn yêu cầu - Auth Service là **CLIENT** gọi Core Service patterns.

## 📁 Files Created/Updated

### 1. Pattern Definition
**File: `apps/auth-service/src/auths/auth.pattern.ts`** ✅ NEW

```typescript
export const LOGIN_USER_PATTERN = 'LOGIN_USER';
export const FIND_USER_PATTERN = 'FIND_USER';
export const FIND_USER_BY_EMAIL_PATTERN = 'FIND_USER_BY_EMAIL';
export const CHECK_USER_PERMISSION_PATTERN = 'CHECK_USER_PERMISSION';
export const INVALIDATE_SESSION_PATTERN = 'INVALIDATE_SESSION';
```

**Lợi ích:**
- Simple string constants
- No complex interfaces
- Easy to share with Core Service
- Clear and maintainable

### 2. Auth Service (CLIENT)
**File: `auths.controller.ts`** ✅ UPDATED

- ✅ Removed all `@MessagePattern` decorators
- ✅ Kept only REST endpoints
- ✅ Clean and focused

**File: `auths.service.ts`** ✅ UPDATED

```typescript
// Gọi Core Service pattern:
async findUser(tenantId: string, body: any) {
  if (!this.coreClient) return null;

  try {
    return await lastValueFrom(
      this.coreClient.send(FIND_USER_PATTERN, {
        tenantId,
        email: body.email,
        username: body.username,
        id: body.id,
      })
    );
  } catch (error) {
    return null;
  }
}
```

## 📚 Example Files Created

### 1. **CORE_SERVICE_PATTERNS_EXAMPLE.ts** - How Core Service Implements

```typescript
@Controller()
export class UserController {
  @MessagePattern(LOGIN_USER_PATTERN)
  async loginUser(@Payload() data: { email: string; tenantId: string }) {
    return this.userService.findByEmail(data.email, data.tenantId);
  }

  @MessagePattern(FIND_USER_PATTERN)
  async findUser(@Payload() data: { tenantId: string; email?: string; ... }) {
    if (data.email) return this.userService.findByEmail(data.email, ...);
    if (data.username) return this.userService.findByUsername(data.username, ...);
    if (data.id) return this.userService.findById(data.id, ...);
  }
}
```

### 2. **AUTH_SERVICE_USAGE_EXAMPLE.ts** - How Auth Service Calls

```typescript
async exampleFindUser(tenantId: string, body: any) {
  const user = await lastValueFrom(
    this.coreClient.send(FIND_USER_PATTERN, {
      tenantId,
      email: body.email,
      username: body.username,
      id: body.id,
    })
  );
  return user;
}
```

## 🔄 Architecture

```
┌─────────────────────────────────────────────┐
│          AUTH SERVICE (CLIENT)              │
├─────────────────────────────────────────────┤
│ auths.controller.ts                         │
│ ├─ POST /auth/login                         │
│ ├─ POST /auth/register                      │
│ ├─ POST /auth/refresh                       │
│ └─ POST /auth/logout                        │
│                                              │
│ auths.service.ts                            │
│ ├─ Gọi: coreClient.send(PATTERN, data)     │
│ ├─ Nhận response từ Core Service            │
│ └─ Xử lý business logic                     │
└─────────────────────────────────────────────┘
         │
         │ TCP Connection
         │
         ▼
┌─────────────────────────────────────────────┐
│        CORE SERVICE (SERVER)                │
├─────────────────────────────────────────────┤
│ user.controller.ts                          │
│ ├─ @MessagePattern(LOGIN_USER_PATTERN)      │
│ ├─ @MessagePattern(FIND_USER_PATTERN)       │
│ ├─ @MessagePattern(FIND_TENANT_BY_...)      │
│ ├─ @MessagePattern(CHECK_USER_PERMISSION)   │
│ └─ @MessagePattern(INVALIDATE_SESSION)      │
│                                              │
│ user.service.ts                             │
│ ├─ findByEmail()                            │
│ ├─ findByUsername()                         │
│ ├─ hasPermission()                          │
│ └─ invalidateSession()                      │
└─────────────────────────────────────────────┘
```

## 📊 Available Patterns

| Pattern | From | To | Payload |
|---------|------|-----|---------|
| `LOGIN_USER_PATTERN` | Auth | Core | `{ email, tenantId }` |
| `FIND_USER_PATTERN` | Auth | Core | `{ tenantId, email?, username?, id? }` |
| `FIND_USER_BY_EMAIL_PATTERN` | Auth | Core | `{ email }` |
| `CHECK_USER_PERMISSION_PATTERN` | Auth | Core | `{ tenantId, userId, permission }` |
| `INVALIDATE_SESSION_PATTERN` | Auth | Core | `{ tenantId, userId }` |

## 🚀 How to Use

### Step 1: Import pattern in Auth Service
```typescript
import { FIND_USER_PATTERN } from './auth.pattern';
```

### Step 2: Call from Auth Service
```typescript
const user = await lastValueFrom(
  this.coreClient.send(FIND_USER_PATTERN, {
    tenantId: 'tenant-123',
    email: 'user@example.com'
  })
);
```

### Step 3: Implement in Core Service
```typescript
@MessagePattern(FIND_USER_PATTERN)
async findUser(@Payload() data: { tenantId: string; email?: string }) {
  return this.userService.findByEmail(data.email, data.tenantId);
}
```

## 💡 Key Points

✅ **Simple** - Just string constants, no complex types
✅ **Clean** - Auth Controller = REST only
✅ **Focused** - Auth = Client, Core = Server
✅ **Maintainable** - Easy to add/modify patterns
✅ **Direct** - No wrappers, direct responses
✅ **Error Handling** - Try-catch in service methods

## 📝 Notes

- Auth Service: **CLIENT** - calls patterns
- Core Service: **SERVER** - handles patterns with `@MessagePattern`
- Use `@Payload()` decorator in Core Service handlers
- Auth Service uses `lastValueFrom()` to convert Observable to Promise
- Error handling done in each service, no global wrapper

## ✨ File Locations

```
apps/auth-service/src/auths/
├── auth.pattern.ts                        ← Pattern constants
├── auths.controller.ts                    ← REST endpoints
├── auths.service.ts                       ← Calls patterns
├── AUTH_SERVICE_USAGE_EXAMPLE.ts          ← How to use
└── CORE_SERVICE_PATTERNS_EXAMPLE.ts       ← Implementation guide
```

---

**Status:** ✅ Refactored to Simplified Pattern Structure

Auth Service is now a clean CLIENT that calls Core Service patterns. Ready for Core Service implementation! 🎉
