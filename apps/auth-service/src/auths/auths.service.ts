import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordHelpers } from 'y/common';
import { UsersService } from '../users/users.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtAuthGuard } from 'y/common';


@Injectable()
export class AuthsService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
   // validate user khi đăng nhập
  async validateUser(username: string, pass: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(username);
      
      if (!user) return null;
      
      const isValidPassword = await comparePasswordHelpers(pass, user.password);
      
      if (!isValidPassword) return null;

      return user;
    } catch (error) {
      return null;
    }
  }

  async login(user: any) {
    const payload = { sub: user._id, username: user.email }; // payload cho JWT: với sub là userId, username là email
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  handleRegister = async (registerDto: CreateAuthDto) => {
    return await this.usersService.handleRegister(registerDto as any);
  }
}