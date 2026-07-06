/**
 * Microservice Message Patterns
 * Các pattern constants để truyền vào coreClient.send()
 */

export const LOGIN_USER_PATTERN = 'login-user';
export const FIND_USER_BY_EMAIL_PATTERN = 'find-user-by-email';
// export const FIND_TENANT_BY_ID_PATTERN = 'find-tenant-by-id';
export const FIND_USER_PATTERN = 'find-user';
export const FIND_USER_BY_ID_PATTERN = 'find-user-by-id';
export const CREATE_USER_PATTERN = 'create-user';
export const UPDATE_USER_PATTERN = 'update-user';
export const DELETE_USER_PATTERN = 'delete-user';
export const CHECK_USER_PERMISSION_PATTERN = 'check-user-permission';
export const GET_USER_PERMISSIONS_PATTERN = 'get-user-permissions';
export const GET_USER_ROLES_PATTERN = 'get-user-roles';
export const ASSIGN_ROLE_PATTERN = 'assign-role';
export const INVALIDATE_SESSION_PATTERN = 'invalidate-session';
export const GET_ACTIVE_SESSIONS_PATTERN = 'get-active-sessions';
export const SAVE_USER_DEVICE_PATTERN = 'save-user-device';
export const SAVE_USER_DEVICE_HISTORY_PATTERN = 'save-user-device-history';

// Export all patterns as object for reference
export const MICROSERVICE_PATTERNS = {
  LOGIN_USER: LOGIN_USER_PATTERN,
  FIND_USER_BY_EMAIL: FIND_USER_BY_EMAIL_PATTERN,
  // FIND_TENANT_BY_ID: FIND_TENANT_BY_ID_PATTERN,
  FIND_USER: FIND_USER_PATTERN,
  FIND_USER_BY_ID: FIND_USER_BY_ID_PATTERN,
  CREATE_USER: CREATE_USER_PATTERN,
  UPDATE_USER: UPDATE_USER_PATTERN,
  DELETE_USER: DELETE_USER_PATTERN,
  CHECK_USER_PERMISSION: CHECK_USER_PERMISSION_PATTERN,
  GET_USER_PERMISSIONS: GET_USER_PERMISSIONS_PATTERN,
  GET_USER_ROLES: GET_USER_ROLES_PATTERN,
  ASSIGN_ROLE: ASSIGN_ROLE_PATTERN,
  INVALIDATE_SESSION: INVALIDATE_SESSION_PATTERN,
  GET_ACTIVE_SESSIONS: GET_ACTIVE_SESSIONS_PATTERN,
  SAVE_USER_DEVICE: SAVE_USER_DEVICE_PATTERN,
  SAVE_USER_DEVICE_HISTORY: SAVE_USER_DEVICE_HISTORY_PATTERN,
} as const;

/**
 * Microservice Request/Response Interfaces
 */

export interface FindUserByEmailRequest {
  email: string;
}

export interface FindUserByEmailResponse {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export interface FindUserRequest {
  tenantId: string;
  email?: string;
  username?: string;
  id?: string;
}

export interface FindUserResponse {
  id: string;
  tenantId: string;
  email: string;
  username?: string;
  roles: string[];
  permissions: string[];
}

export interface CheckUserPermissionRequest {
  tenantId: string;
  userId: string;
  permission: string;
  resource?: string;
}

export interface CheckUserPermissionResponse {
  hasPermission: boolean;
}

export interface InvalidateSessionRequest {
  tenantId: string;
  userId: string;
  sessionId?: string;
}

export interface InvalidateSessionResponse {
  success: boolean;
  message: string;
}
