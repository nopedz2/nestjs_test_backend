import { Model, Query, Document } from 'mongoose';
import { IUsersRepository } from './base.repository.interface';

// base repository no longer injects a concrete model directly; subclasses provide the model
export class BaseRepository<T extends Document> implements IUsersRepository<T> {
  constructor(
    protected readonly userModel: Model<T>,
  ) {}

  findByEmail(email: string): Promise<T | null> {
    return this.userModel.findOne({ email }).exec();
  }

  exists(filter: any): Promise<boolean> {
    return this.userModel.exists(filter).then(u => !!u);
  }

  create(data: Partial<T>): Promise<T> {
    return this.userModel.create(data as any);
  }

  countDocuments(filter: any): Promise<number> {
    return this.userModel.countDocuments(filter).exec();
  }

  find(filter: any): Query<any, T> {
    return this.userModel.find(filter);
  }

  findById(id: string): Query<any, T> {
    return this.userModel.findById(id);
  }

  findOne(id: string): Promise<T| null> {
    return this.userModel.findOne({ _id: id }).exec();
  }

  findByIdAndUpdate(id: string, updateData: any, opts: any = {}) : Query<any, T> {
    return this.userModel.findByIdAndUpdate(id, updateData, opts);
  }

  findByIdAndDelete(id: string): Query<any, T> {
    return this.userModel.findByIdAndDelete(id);
  }
  updateRefreshToken(userId: string, refreshToken: string): Promise<T> {
    return this.userModel.findByIdAndUpdate(userId, { refreshToken }, { new: true }).exec(); // { new: true } để trả về document sau khi đã cập nhật
  }
}
