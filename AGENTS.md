# AI Agent Instructions for nestjs-demo

## Project type
- NestJS monorepo with multiple app projects under `apps/`.
- Key services: `apps/auth-service`, `apps/business`, `apps/masterdata`, `apps/worker`.
- Shared code lives in `libs/common/src`.

## Important conventions
- Each app uses NestJS module/service/controller structure.
- The auth service uses Mongoose with schemas under `apps/auth-service/src/users/schema`.
- There is a path alias `y/common` mapped to `libs/common/src` in Jest and likely tsconfig paths.
- Global validation is enabled in `apps/auth-service/src/main.ts` via `ValidationPipe`.

## Common development tasks
- Install dependencies: `npm install`
- Run auth service in dev: `npm run start:dev:auth`
- Run any service in dev: `npm run start:dev:<project>` where `<project>` can be `auth`, `business`, `masterdata`, `worker`.
- Debug auth service: `npm run start-auth:debug`
- Build: `npm run build`
- Format: `npm run format`
- Lint: `npm run lint`
- Tests: `npm run test`, `npm run test:e2e`

## What AI should know
- Avoid making broad architectural changes without user confirmation; prefer working within the existing NestJS app structure.
- For auth-service changes, stay inside `apps/auth-service/src` unless the user requests shared-lib updates.
- If adding API validation, use class-validator decorators in DTOs and leverage the existing `ValidationPipe` config.
- When modifying user behavior, check the schema and service logic first, especially for features like soft delete (`deletedAt`).

## Useful files
- `package.json` for scripts and dependency versions
- `apps/auth-service/src/main.ts` for app bootstrap and global pipes
- `apps/auth-service/src/users/dto/find-users-query.dto.ts` for query validation patterns
- `apps/auth-service/src/users/users.service.ts` for business logic and Mongoose queries
- `apps/auth-service/src/users/schema/user.schema.ts` for user data shape

## Notes for the agent
- Prefer updating existing files over adding new ones unless the user explicitly asks.
- Keep changes minimal and aligned with NestJS conventions.
- If the user asks about API behavior, inspect the relevant controller/service pair first.
