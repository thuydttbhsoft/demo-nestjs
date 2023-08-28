import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogSchema } from './blog.model';
import { modelsName } from 'src/common/constants/modelsName';
// import { UserSchema } from 'src/user/user.model';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: modelsName.BLOG, schema: BlogSchema }]),
  ],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
