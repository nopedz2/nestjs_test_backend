# Microservice Auth Pattern

## Mục tiêu
Lưu lại cách xây dựng dịch vụ xác thực (Auth) theo mô hình microservice để áp dụng cho dự án khác.

## Kiến trúc chính

1. `AuthModule`
   - Import `ClientsModule.register([CoreServiceClient])` để tạo `ClientProxy` kết nối với microservice lõi.
   - Import `HttpModule` để gọi API bên ngoài (ví dụ lấy public key từ Keycloak).
   - Import các module dùng chung như `LoggerModule` và `MfxSolutionModule`.

2. `AuthService`
   - Thực hiện logic xác thực và giao tiếp microservice:
     <!-- - `exchangeToken(tenantId, payload)` -->
   - `findUserByEmail(email)`
     - `findUser(tenantId, body)`
     - `getPublicKey(tenantId)`
     - `generateToken(id, email, tenantId)`
   - Dùng `ClientProxy.send(pattern, payload)` để gọi các pattern message với dịch vụ lõi.
   - Dùng `HttpService` để lấy public key từ Keycloak và verify JWT với `JwtService`.
   - Quản lý lỗi rõ ràng, log chi tiết, trả về data/error với code phù hợp.

3. `AuthController`
   - Định nghĩa endpoint:
     - `POST /auth/login`
     - `POST /auth/exchange-token`
     - `POST /auth/user-token` (nội bộ, dùng guard bí mật)
     - `GET /auth/profile`
   - Có thể chạy độc lập nếu chưa có Core Service: endpoint login vẫn dùng local user repo, còn các endpoint microservice hoặc tenant-specific sẽ cần `CORE_SERVICE` hoặc fallback phù hợp.
   - Dùng các decorator và DTO từ package chung để đảm bảo contract rõ ràng.
   - Sử dụng `DataResponse<T>` để chuẩn hóa phản hồi API.
   - Gắn guard / tenants / permission cho các endpoint cần bảo mật.

4. `PermissionGuard` (và guard khác)
   - Kiểm tra JWT `Authorization: Bearer ...` từ header.
   - Giải mã token với `JwtService` và `ConfigService`.
   - Lấy user cache và đưa vào request trước khi xử lý controller.

## Các điểm quan trọng để tái sử dụng

- **Tách biệt service và controller**: Controller chỉ nhận request, gọi service và trả response.
- **Dùng message patterns cho microservice**: Sử dụng `ClientProxy` và `lastValueFrom(...)` để gọi các pattern service lõi.
- **Xác thực JWT**:
  - Lấy public key từ Keycloak bằng `HttpService`.
  - Verify token với `JwtService.verify()`.
  - Xử lý lỗi token hết hạn và token không hợp lệ.
- **Tổ chức DTO/response chung**: Dùng DTO và response model từ package chung để đồng bộ với các service khác.
- **Logging**: Log rõ ràng từng bước để dễ debug.
- **Guard + decorator**: Dùng guard để bảo vệ endpoint và decorator `@Tenant()` / `@HasPermissions()` để inject thông tin tenant, permission.

## Cách áp dụng cho dự án của bạn

1. Tạo một module tương tự `AuthModule`.
2. Bổ sung `ClientsModule` với cấu hình microservice phù hợp (RabbitMQ, TCP, Redis, v.v.) hoặc với client service của hệ thống bạn.
3. Viết `AuthService` xử lý logic core, verify token, tạo token, gọi dịch vụ khác.
4. Viết `AuthController` với endpoint cụ thể, sử dụng DTO/response tùy theo API của bạn.
5. Nếu dùng shared packages, gộp các model / DTO vào thư viện nội bộ, hoặc dùng DTO tương tự.
6. Cấu hình `JwtModule`/`ConfigModule` để lấy secret/issuer/expiry từ environment.
7. Thêm guard để xác thực và phân quyền.

## Những gì cần chuẩn bị

- `CORE_SERVICE` hoặc cấu hình microservice client của bạn.
- `CORE_SERVICE_HOST` và `CORE_SERVICE_PORT` để kết nối đến dịch vụ lõi qua TCP.
- `AUTH_INTERNAL_SECRET` để bảo vệ endpoint nội bộ `POST /auth/user-token`.
- `KEYCLOAK_ISSUER` (hoặc endpoint tương tự) để xác thực token.
- Các DTO và message pattern tương ứng với service của bạn.
- Logger và cache nếu muốn tối ưu hiệu năng.

## Kết luận
Mẫu này là một dịch vụ auth NestJS với:
- controller rõ ràng,
- service chuyên trách gọi microservice và xử lý JWT,
- module cấu hình `ClientsModule` + `HttpModule`,
- guard để bảo vệ API.

Bạn có thể lấy file này làm template và thay đổi các pattern message, endpoint, DTO cho phù hợp với hệ thống của mình.