import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterUserDto } from 'src/auth/dto/registerUser.dto';
import { modelsName } from '../common/constants/modelsName';
import { User, UserDocument } from './user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(modelsName.USER)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find();
  }
  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id);
  }

  async update(
    id: string,
    updateUserDto: { refreshToken: string },
  ): Promise<UserDocument> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async createUser(user: RegisterUserDto): Promise<User> {
    return this.userModel.create(user);
  }

  async getUser(query: object): Promise<UserDocument> {
    return this.userModel.findOne(query);
  }
}
