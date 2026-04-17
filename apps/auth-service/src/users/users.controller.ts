import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, JwtAuthGuard } from 'y/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users') 
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Public()
  findAll(@Query('query') query: string,
          @Query('current') current: string,
          @Query('pageSize') pageSize: string
) {
    return this.usersService.findAll(query, +current, +pageSize );
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);
    return user;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('my-profile')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  update(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.sub;
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
