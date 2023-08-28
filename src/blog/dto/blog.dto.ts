import { IsNotEmpty } from 'class-validator';
import { User } from 'src/user/user.model';

export class BlogDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  author: User;
}
