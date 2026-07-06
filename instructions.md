# Project Instructions for nestjs-demo

## Purpose
This file provides concise agent guidance for the NestJS monorepo in this workspace.

## Primary goals
- Keep changes minimal and aligned with existing NestJS conventions.
- Prefer editing files under `apps/auth-service/src` for auth-related work.
- Use DTO validation when adding or changing API query/body parameters.
- Avoid broad refactors unless the user explicitly asks.

## Key files
- `package.json` — scripts and project dependencies
- `apps/auth-service/src/main.ts` — global app bootstrap and validation pipe
- `apps/auth-service/src/users/dto/find-users-query.dto.ts` — query validation patterns
- `apps/auth-service/src/users/users.service.ts` — user business logic and Mongoose queries
- `apps/auth-service/src/users/schema/user.schema.ts` — user schema definition

## Development commands
- `npm install`
- `npm run start:dev:auth`
- `npm run start-auth:debug`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run test:e2e`

## Notes
- The project is a NestJS monorepo with multiple app projects under `apps/`.
- Shared code lives in `libs/common/src` and is imported via the `y/common` path alias.
- The auth service uses Mongoose and class-validator heavily.

## When asked about validation
- Check `FindUsersQueryDto` and existing DTO decorators.
- The app already uses a global `ValidationPipe` with `whitelist: true`.
- Prefer adding `@IsEnum`, `@IsString`, `@IsInt`, `@Min`, `@Max` rather than custom parsing when possible.
