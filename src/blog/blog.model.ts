import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../user/user.model';
import { Type } from 'class-transformer';
import { modelsName } from '../common/constants/modelsName';
export type BlogDocument = Blog & Document;

@Schema({ timestamps: true })
export class Blog {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: modelsName.USER })
  @Type(() => User)
  author: User;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
