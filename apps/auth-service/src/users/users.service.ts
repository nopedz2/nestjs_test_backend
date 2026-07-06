import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPasswordHelpers } from 'y/common';
// import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { ChangePasswordAuthDto } from './dto/change-password-auth.dto';
import { compare } from 'bcrypt';
import { UserDocument } from './schema/user.schema';
import { UsersRepository } from './user.repository';
import { UserDto } from './dto/user.dto';
import { plainToInstance } from 'class-transformer';
import {
  FindUsersQueryDto,
  SortField,
  SortOrder,
} from './dto/find-users-query.dto';

@Injectable()
export class UsersService {
  constructor(protected readonly repo: UsersRepository) {}

  isEmailExist = async (email: string) => {
    return this.repo.exists({ email });
  };

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    // returned object will be a plain user without password, not the mongoose document

    const { name, email, phone, address, isActive, role } = createUserDto;
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException('Email already exists');
    }
    const hashPassword = await hashPasswordHelpers(createUserDto.password);
    const user: UserDocument = await this.repo.create({
      name,
      email,
      password: hashPassword,
      phone,
      address,
      isActive: isActive ?? false,
      role: role ?? 'USER',
    });
    // Use plainToInstance for consistent data transformation and automatic password exclusion
    return plainToInstance(UserDto, user.toObject(), {
      excludeExtraneousValues: true, // Ensure only fields defined in UserDto are returned, password is excluded
    });
  }
  // Search, pagination, sorting, filtering
  // Note: For large datasets, consider using aggregation pipeline to calculate totalItems and fetch data in a single query
  // Also, add indexes to search fields (name, email) in the schema for faster queries
  async findAll(dto: FindUsersQueryDto) {
    const {
      current = 1,
      pageSize = 10,
      sort = [
        {
          field: SortField.CREATED,
          order: SortOrder.DESC,
        },
      ],
      search,
    } = dto;

    if (current < 1) {
      throw new BadRequestException('current must be at least 1');
    }
    if (pageSize < 1) {
      throw new BadRequestException('pageSize must be at least 1');
    }

    const filter = this.buildFilter(search);
    const filterWithDeleted = { ...filter, deletedAt: null }; // Exclude soft deleted records
    const totalItems = await this.repo.countDocuments(filterWithDeleted);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    // build query using repository helper (repo returns queryable object)
    let q = this.repo
      .find(filterWithDeleted)
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .lean();

    if (sort && sort.length > 0) {
      const sortObject: Record<string, 1 | -1> = {}; // Convert sort array to object for Mongoose
      sort.forEach((item) => {
        sortObject[item.field] = item.order === SortOrder.DESC ? -1 : 1;
      });
      q = q.sort(sortObject);
    }

    // if (population) q = q.populate(population);

    const data = await q.exec();

    return {
      data,
      meta: {
        totalItems,
        totalPages,
        currentPage: current,
        pageSize,
      },
    };
  }

  private buildFilter(search?: string): any {
    const filter: any = {};

    // search keyword
    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          email: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    return filter;
  }

  async findOne(id: string) {
    const user = await this.repo
      .findById(id)
      .where('deletedAt')
      .equals(null)
      .select('-password')
      .lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Check if user exists and is not soft deleted
    const user = await this.repo
      .findById(userId)
      .where('deletedAt')
      .equals(null);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Prepare update data (only include provided fields)
    const updateData: any = {};
    if (updateUserDto.name !== undefined) updateData.name = updateUserDto.name;
    if (updateUserDto.phone !== undefined)
      updateData.phone = updateUserDto.phone;
    if (updateUserDto.address !== undefined)
      updateData.address = updateUserDto.address;
    if (updateUserDto.image !== undefined)
      updateData.image = updateUserDto.image;

    // Update and return sanitized user
    const updatedUser = await this.repo
      .findByIdAndUpdate(userId, updateData, { new: true })
      .where('deletedAt')
      .equals(null)
      .lean();

    return plainToInstance(UserDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  async remove(_id: string) {
    //check valid mongoose id
    if (mongoose.Types.ObjectId.isValid(_id)) {
      // soft delete
      const user = await this.repo
        .findByIdAndUpdate(_id, { deletedAt: new Date() }, { new: true })
        .exec();
      if (!user) {
        throw new BadRequestException('User not found');
      }
      return user;
    } else {
      throw new BadRequestException('Invalid user ID');
    }
  }

  async restore(_id: string) {
    //restore soft deleted user
    if (mongoose.Types.ObjectId.isValid(_id)) {
      const user = await this.repo
        .findByIdAndUpdate(_id, { deletedAt: null }, { new: true })
        .exec();
      if (!user) {
        throw new BadRequestException('User not found');
      }
      return user;
    } else {
      throw new BadRequestException('Invalid user ID');
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordAuthDto,
  ) {
    const { oldPassword, newPassword } = changePasswordDto;
    if (oldPassword === newPassword) {
      throw new ConflictException(
        'New password must be different from old password',
      );
    }
    const user = await this.repo
      .findById(userId)
      .where('deletedAt')
      .equals(null)
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.password) {
      throw new BadRequestException('User password not set');
    }

    // Compare oldPassword with hashed password in database
    const isMatch = await compare(oldPassword, user.password);
    if (!isMatch) {
      throw new ConflictException('Old password is incorrect');
    }

    // Hash and update newPassword
    const newHashedPassword = await hashPasswordHelpers(newPassword);
    user.password = newHashedPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }
}
