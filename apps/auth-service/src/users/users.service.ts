import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.schema';
import mongoose, { Model } from 'mongoose';
import { hashPasswordHelpers } from 'y/common';
import aqp from 'api-query-params';
import { register } from 'node:module';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  // constructor và các phương thức khác: bao gồm create, findAll, findOne, update, remove
  constructor(
    @InjectModel(User.name) // Inject the User model : gồm UserDocument
    private userModel: Model<UserDocument>,   // mongoose model
    private readonly mailerService: MailerService  // MailerService
  ) {}

  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) return true;
    return false;
  };

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, phone, address } = createUserDto;
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException('Email already exists');
    }
    const hashPassword = await hashPasswordHelpers(createUserDto.password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      phone,
      address,
    });
    return {
      ...user.toObject(),  // convert mongoose document to plain object
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

    const totalItems = await this.userModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    let q = this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip || (current - 1) * pageSize)
      .sort({ createdAt: -1 })
      .select('-password');  // Loại bỏ password

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
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async update(
    updateUserDto: UpdateUserDto,
  ) {
    return this.userModel
      .findByIdAndUpdate({_id: updateUserDto._id}, updateUserDto, { new: true }) // trả về document sau khi cập nhật
      .exec();
  }

  async remove(_id: string) {
    //check valid mongoose id
    if(mongoose.Types.ObjectId.isValid(_id)) {
      // delete
      return this.userModel.findByIdAndDelete(_id).exec();
  }else{
    throw new BadRequestException('Invalid user ID');
  }
}

  async handleRegister(registerDto: CreateUserDto) {
        const { name, email, phone } = registerDto;
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException('Email already exists');
    }
    const hashPassword = await hashPasswordHelpers(registerDto.password);
    const codeId = uuidv4();
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      isActive: false,
      codeId: codeId,
      codeExpire: dayjs().add(1, 'minutes').toDate(),
    });
    await this.mailerService.sendMail(
      {
        to: user.email, // list of receivers
        from: 'noreply@nestjs.com', // sender address
        subject: 'Activate your account at @noe', // Subject line
        text: 'welcome', // plaintext body
        template:"register.hbs",
        context:{
          name:user?.name ?? user.email, // sử dụng tên nếu có, nếu không thì dùng email
          activationCode:codeId   // mã kích hoạt
        }
      }
    )
    return {
      _id: user._id,
    };
    
}
}
