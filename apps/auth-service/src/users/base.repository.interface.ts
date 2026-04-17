import { Query, Document } from 'mongoose';

export interface IUsersRepository<T extends Document> {
  findByEmail(email: string): Promise<T | null>;
  exists(filter: any): Promise<boolean>;
  create(data: Partial<T>): Promise<T>;
  countDocuments(filter: any): Promise<number>;
  find(filter: any): Query<any, T>;
  findById(id: string): Query<any, T>;
  findOne(id: string): Promise<T | null>;
  findByIdAndUpdate(id: string, updateData: any, opts?: any): Query<any, T>;
  findByIdAndDelete(id: string): Query<any, T>;
}
