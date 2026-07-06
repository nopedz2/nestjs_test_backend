import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, JwtAuthGuard } from 'y/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Public()
  findAll(@Query() queryDto: FindUsersQueryDto) {
    return this.usersService.findAll(queryDto);
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    const user = await this.usersService.findOne(req.user.sub);
    return plainToInstance(UserProfileDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Patch('my-profile')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  update(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.sub;
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/restore')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  restore(@Param('id') id: string) {
    return this.usersService.restore(id);
  }
}
