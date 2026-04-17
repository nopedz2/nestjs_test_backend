import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./schema/user.schema";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel(User.name)
    protected readonly userModel: Model<UserDocument>, 
  ) {
    super(userModel);
  }
}