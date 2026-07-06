import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
// import { Tenant, TenantDocument } from './schema/tenant.schema';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    // @InjectModel(Tenant.name)
    // private readonly tenantModel: Model<TenantDocument>,
  ) {}

  async findByEmail(email: string) {
    const filter = { email, deletedAt: null };
    return this.userModel.findOne(filter).select('-password').lean().exec();
  }

  async findByUsername(username: string) {
    const filter = { username, deletedAt: null };
    return this.userModel.findOne(filter).select('-password').lean().exec();
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const filter = { id, deletedAt: null };
    return this.userModel.findOne(filter).select('-password').lean().exec();
  }

  // async findUserByEmail(email: string) {
  //   return this.userModel.findOne({ email }).lean().exec();
  // }

  async hasPermission(
    userId: string,
    permission: string,
    // resource?: string,
  ) {
    const user = await this.userModel
      .findOne({ userId, deletedAt: null })
      .lean()
      .exec();

    if (!user) {
      return false;
    }

    const permissions = Array.isArray(user.permissions) ? user.permissions : [];

    return permissions.includes(permission);
  }

  async invalidateSession(userId: string, sessionId?: string) {
    if (!Types.ObjectId.isValid(userId)) {
      return false;
    }

    const user = await this.userModel.findOne({ userId, deletedAt: null });
    if (!user) {
      return false;
    }

    if (!user.sessions || user.sessions.length === 0) {
      return false;
    }

    if (sessionId) {
      const session = user.sessions.find(
        (item) => item.sessionId === sessionId && item.valid,
      );
      if (!session) {
        return false;
      }
      session.valid = false;
    } else {
      user.sessions = user.sessions.map((item) => ({
        ...item,
        valid: false,
      }));
    }

    await user.save();
    return true;
  }
}
