import {
  NestMiddleware,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';

/** The AuthMiddleware is used to
 * (1) read the request header bearer token/user access token
 * (2) decrypt the access token to get the user object
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async use(req: Request | any, res: Response, next: () => void) {
    const bearerHeader = req.headers.authorization;
    const accessToken = bearerHeader && bearerHeader.split(' ')[1];
    let user;

    if (!bearerHeader || !accessToken) {
      throw new UnauthorizedException('Please register or sign in.');
    }

    try {
      const { email } = this.jwtService.verify(accessToken, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      user = await this.userService.getUser({ email });
      if (!user) throw new UnauthorizedException('Please register or sign in.');
      req.user = user;
      next();
    } catch (error) {
      throw new ForbiddenException("Invalid token or user doesn't exist.");
    }
  }
}
