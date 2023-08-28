import {
  ForbiddenException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
// import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.getUser({ email });
    // if (!user) return null;
    if (!user) {
      throw new NotAcceptableException('could not find the user');
    }
    const passwordValid = await bcrypt.compare(password, user.password);

    if (user && passwordValid) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const access_token = await this.getAccessToken(user);
    const refresh_token = await this.getRefreshToken(user);
    return {
      access_token,
      refresh_token,
    };
  }

  async getRefreshToken(user: any) {
    const payload = { id: user._id };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_EXPIRES_REFRESH_TOKEN_IN,
    });
  }

  async getAccessToken(user: any) {
    const payload = { email: user.email, id: user._id };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  async refreshTokens(refreshToken: string) {
    const { id } = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    const user = await this.userService.findById(id);
    if (!user) throw new ForbiddenException('Access Denied');
    const tokens = await this.login(user);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    await this.userService.update(userId, {
      refreshToken: refreshToken,
    });
  }

  async logout(userId: string) {
    this.userService.update(userId, { refreshToken: null });
  }
}
