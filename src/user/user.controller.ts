import { BadRequestException, Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.model';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  async getAllUsers(): Promise<User[]> {
    try {
      const result = await this.userService.getAllUsers();
      return result;
    } catch (error) {
      throw new BadRequestException('Failed to get list user.');
    }
  }
}
