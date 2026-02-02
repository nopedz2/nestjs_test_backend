import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class UpdateUserDto  {
       @IsMongoId({ message: 'Invalid user ID' })
       @IsNotEmpty({ message: 'User ID is required' })
        _id: string;
        name: string;
        phone: string;
        address?: string;
        image?: string;
}
