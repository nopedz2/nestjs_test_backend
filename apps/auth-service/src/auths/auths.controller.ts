import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { JwtAuthGuard } from 'y/common';
import { Public } from 'y/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
@Controller('auths')
export class AuthsController {
  constructor(
    private readonly authsService: AuthsService,
    private readonly mailerService: MailerService
  ) {}

  @Post("login")
  @Public()
  @UseGuards( LocalAuthGuard) // Sử dụng LocalAuthGuard để xác thực người dùng
  handleLogin(@Request() req) {
    return this.authsService.login(req.user);  // req.user được gán bởi LocalAuthGuard
}

  @Post('register')
  @Public()
 register (@Body() registerDto: CreateAuthDto) {
    return this.authsService.handleRegister(registerDto);
  }

  @Get('mail')
  @Public()
  testMail () {
    this.mailerService
      .sendMail({
        to: 'dinhthihoa20101975tb@gmail.com', // list of receivers
        from: 'noreply@nestjs.com', // sender address
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body
        template:"register.hbs",
        context:{
          name:"nope",
          activationCode:123456789
        }
      })
    return "ok";
  }
}
