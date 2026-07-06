import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import {
  LOGIN_USER_PATTERN,
  FIND_USER_PATTERN,
  FIND_USER_BY_EMAIL_PATTERN,
  CHECK_USER_PERMISSION_PATTERN,
  INVALIDATE_SESSION_PATTERN,
} from '../microservice-patterns';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(LOGIN_USER_PATTERN)
  async loginUser(
    @Payload()
    data: {
      email: string;
    },
  ) {
    return this.usersService.findByEmail(data.email);
  }

  @MessagePattern(FIND_USER_PATTERN)
  async findUser(
    @Payload()
    data: {
      email?: string;
      username?: string;
      id?: string;
    },
  ) {
    if (data.email) {
      return this.usersService.findByEmail(data.email);
    }
    if (data.username) {
      return this.usersService.findByUsername(data.username);
    }
    if (data.id) {
      return this.usersService.findById(data.id);
    }
    return null;
  }

  @MessagePattern(FIND_USER_BY_EMAIL_PATTERN)
  async findUserByEmail(
    @Payload()
    data: {
      email: string;
    },
  ) {
    return this.usersService.findByEmail(data.email);
  }

  @MessagePattern(CHECK_USER_PERMISSION_PATTERN)
  async checkUserPermission(
    @Payload()
    data: {
      userId: string;
      permission: string;
      resource?: string;
    },
  ) {
    const hasPermission = await this.usersService.hasPermission(
      data.userId,
      data.permission,
      // data.resource,
    );
    return { hasPermission };
  }

  @MessagePattern(INVALIDATE_SESSION_PATTERN)
  async invalidateSession(
    @Payload()
    data: {
      userId: string;
      sessionId?: string;
    },
  ) {
    const success = await this.usersService.invalidateSession(
      data.userId,
      data.sessionId,
    );
    return { success };
  }
}
