import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.model';
import { modelsName } from '../common/constants/modelsName';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: modelsName.USER, schema: UserSchema }]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
