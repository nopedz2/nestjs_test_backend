import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPasswordHelpers } from 'y/common';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { ChangePasswordAuthDto } from './dto/change-password-auth.dto';
import { compare } from 'bcrypt';
import { User, UserDocument } from './schema/user.schema';
import { UsersRepository } from './user.repository';



@Injectable()
export class UsersService {
  // constructor và các phương thức khác: bao gồm create, findAll, findOne, update, remove
  constructor(
    protected readonly repo: UsersRepository,
  ) {}


  isEmailExist = async (email: string) => {
    return this.repo.exists({ email });
  };

  async create(createUserDto: CreateUserDto): Promise<any> {
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
    return {
      ...user.toObject(), // chuyển đổi document thành plain object để có thể xóa trường password
      password: undefined,
    };
  }
 // tìm kiêm và phân trang, sắp xếp, lọc
  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort, population } = aqp(query);
    if(!filter.current) delete filter.current;
    if(!filter.pageSize) delete filter.pageSize;
    if(!current) current = 1;
    if(!pageSize) pageSize = 10;

    const totalItems = await this.repo.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    // build query using repository helper (repo returns queryable object)
    let q = this.repo.find(filter)
      .limit(pageSize)
      .skip(skip || (current - 1) * pageSize)
      .sort({ createdAt: -1 })
      .select('-password')
      .lean();

    if (sort) q = q.sort(sort as any);
    if (pageSize && skip) q = q.limit(pageSize).skip(skip);
    if (population) q = q.populate(population);
    
    const data = await q.exec();
    
    return {
      data,
      meta: {
        totalItems,
        totalPages,
        currentPage: current,
        pageSize
      }
    };
}

  async findOne(id: string): Promise<User | null> {
    return this.repo.findById(id)
      .select('-password -createdAt -updatedAt -__v -isActive -codeId -codeExpire')
      .exec();
  }


  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ) {
    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Check if user exists
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Prepare update data (only include provided fields)
    const updateData: any = {};
    if (updateUserDto.name !== undefined) updateData.name = updateUserDto.name;
    if (updateUserDto.phone !== undefined) updateData.phone = updateUserDto.phone;
    if (updateUserDto.address !== undefined) updateData.address = updateUserDto.address;
    if (updateUserDto.image !== undefined) updateData.image = updateUserDto.image;

    // Update and return sanitized user
    const updatedUser = await this.repo
      .findByIdAndUpdate(userId, updateData, { new: true })
      .select('-password -createdAt -updatedAt -__v -isActive -codeId -codeExpire')
      .exec();

    return updatedUser;
  }

  async remove(_id: string) {
    //check valid mongoose id
    if(mongoose.Types.ObjectId.isValid(_id)) {
      // delete
      return this.repo.findByIdAndDelete(_id).exec();
    } else {
      throw new BadRequestException('Invalid user ID');
    }
  }



  async changePassword(userId: string, changePasswordDto: ChangePasswordAuthDto) {
    const user = await this.repo.findById(userId); // Lấy user và bao gồm trường password
    const { oldPassword, newPassword } = changePasswordDto;

    if (!user) {
      throw new BadRequestException('User not found');
    }
    const isMatch = await compare(oldPassword, user.password); // So sánh oldPassword với password đã hash trong database
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    const newHashedPassword = await hashPasswordHelpers(newPassword); // Hash newPassword
    user.password = newHashedPassword;    
    if(oldPassword === newPassword) {
      throw new BadRequestException('New password must be different from old password');
    }
    await user.save();

    return { message: 'Password changed successfully' };
  }

}
