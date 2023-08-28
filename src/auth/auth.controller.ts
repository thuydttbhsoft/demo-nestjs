import {
  Controller,
  Post,
  UseGuards,
  Body,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Get,
  Request,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from 'src/user/user.model';
import { RegisterUserDto } from './dto/registerUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guard';

@Controller('/api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('signup')
  async registerUser(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    const { email, password } = registerUserDto;

    const existingUser = await this.userService.getUser({ email });

    if (existingUser) {
      throw new BadRequestException('User already exists.');
    }

    try {
      // Hash user password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await this.userService.createUser({
        ...registerUserDto,
        password: hashedPassword,
      });

      return user;
    } catch (error) {
      throw new BadRequestException('Failed to register user.');
    }
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string }> {
    try {
      const { email, password: loginPassword } = loginUserDto;
      let existingUser: UserDocument;
      let isValid: boolean;

      try {
        existingUser = await this.userService.getUser({ email });
        isValid = await bcrypt.compare(loginPassword, existingUser.password);
      } catch (error) {
        throw new ForbiddenException('Username or password is invalid');
      }

      if (!isValid) {
        throw new ForbiddenException('Username or password is invalid');
      }

      const tokens = await this.authService.login(existingUser);
      await this.authService.updateRefreshToken(
        existingUser.id,
        tokens.refresh_token,
      );
      return tokens;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('logout')
  logout(@Request() req) {
    this.authService.logout(req.user.id);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req) {
    try {
      //   const userId = req.user.id;
      const refreshToken = req.user['refreshToken'];
      return this.authService.refreshTokens(refreshToken);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
