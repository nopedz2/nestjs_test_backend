import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordHelpers, hashPasswordHelpers } from 'y/common';
import { CreateAuthDto } from './dto/create-auth.dto';

import { MailerService } from '@nestjs-modules/mailer';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/schema/user.schema';
import { UsersRepository } from '../users/user.repository';


@Injectable()
export class AuthsService {
  constructor(
    private readonly repo: UsersRepository,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}
  // validate user khi đăng nhập
  async validateUser(email: string, pass: string): Promise<any> {
    try {
      const user = await this.repo.findByEmail(email);
      
      if (!user) return null;
      
      const isValidPassword = await comparePasswordHelpers(pass, user.password);
      
      if (!isValidPassword) return null;

      return user;
    } catch (error) {
      return null;
    }
  }

  // issue JWT and return token (same logic as UsersService.login)
  async login(user: any) {
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user._id?.toString ? user._id.toString() : user._id,
      username: user.email,
      role: user.role ?? 'USER',
    };

    const access_token = await this.jwtService.signAsync(payload);

    // sanitize user object (remove sensitive fields)
    let safeUser: any = user;
    try {
      safeUser = user && typeof user.toObject === 'function' ? user.toObject() : { ...user };
    } catch (err) {
      safeUser = { ...user };
    }
    if (safeUser) delete safeUser.password;

    return {
      access_token,
    };
  }

  // registration flow orchestrates all business logic
  async handleRegister(registerDto: CreateAuthDto) {
    const { email, password } = registerDto;

    // Check if email already exists
    const emailExists = await this.repo.exists({ email });
    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password and generate activation code
    const hashPassword = await hashPasswordHelpers(password);
    const codeId = uuidv4();

    // Create user via repository (pure data access)
    const user = await this.repo.create({
      email,
      password: hashPassword,
      isActive: true,
      codeId,
      codeExpire: dayjs().add(1, 'minutes').toDate(),
    });

    // Send activation email
    await this.mailerService.sendMail({
      to: user.email,
      from: 'noreply@nestjs.com',
      subject: 'Activate your account at @noe',
      text: 'welcome',
      template: 'register.hbs',
      context: {
        name: user?.name ?? user.email,
        activationCode: codeId,
      },
    });

    return { _id: user._id };
  }
}
