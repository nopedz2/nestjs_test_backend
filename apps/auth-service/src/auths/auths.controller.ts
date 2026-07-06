import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthsService } from './auths.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { JwtAuthGuard } from 'y/common';
import { Public } from 'y/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutAuthDto } from './dto/logout-auth.dto';
import { ExchangeTokenDto } from './dto/exchange-token.dto';
import { UserTokenDto } from './dto/user-token.dto';
import { InternalAuthGuard } from './guards/internal-auth.guard';

@Controller('auth')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  handleLogin(@Body() loginDto: LoginAuthDto, @Request() req: any) {
    return this.authsService.login(req.user);
  }

  @Post('register')
  @Public()
  register(@Body() registerDto: CreateAuthDto) {
    return this.authsService.handleRegister(registerDto);
  }

  @Post('refresh')
  @Public()
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authsService.refreshToken(refreshTokenDto.refresh_token);
  }

  @Post('logout')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: any, @Body() logoutDto: LogoutAuthDto) {
    const userId = req.user.sub;
    return this.authsService.logout(userId, logoutDto.refresh_token);
  }

  @Post('exchange-token')
  @Public()
  async exchangeToken(@Body() exchangeDto: ExchangeTokenDto) {
    return this.authsService.exchangeToken(exchangeDto.token);
  }

  @Post('user-token')
  @UseGuards(InternalAuthGuard)
  async createUserToken(@Body() dto: UserTokenDto) {
    return this.authsService.generateToken(
      dto.userId,
      dto.email /*, dto.tenantId */,
    );
  }

  @Get('profile')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) {
    return { profile: req.user };
  }
}
