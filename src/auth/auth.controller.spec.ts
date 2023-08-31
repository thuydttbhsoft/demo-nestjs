import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/registerUser.dto';
import { AuthController } from './auth.controller';
import { User, UserDocument } from 'src/user/user.model';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/loginUser.dto';
// Mock bcrypt module
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));
describe('UserController', () => {
  let authController: AuthController;
  let userService: UserService;
  let authService: AuthService;
  const mockUserService = {
    getUser: jest.fn(),
    createUser: jest.fn(),
  };
  const mockAuthService = {
    updateRefreshToken: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const registerUserDto: RegisterUserDto = {
        name: 'test',
        email: 'test@example.com',
        password: 'testpassword',
      };

      const mockedExistingUser = null; // No existing user
      const hashedPassword = 'hashedPassword'; // Example hashed password

      userService.getUser = jest.fn().mockResolvedValue(mockedExistingUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword); // Mock bcrypt.hash
      userService.createUser = jest
        .fn()
        .mockResolvedValue({ ...registerUserDto } as User);

      const result = await authController.registerUser(registerUserDto);

      expect(result).toEqual({ ...registerUserDto }); // Assuming createUser returns the same object

      expect(userService.getUser).toHaveBeenCalledWith({
        email: registerUserDto.email,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(
        registerUserDto.password,
        expect.any(Number),
      );
      expect(userService.createUser).toHaveBeenCalledWith({
        ...registerUserDto,
        password: hashedPassword,
      });
    });

    it('should throw BadRequestException if user already exists', async () => {
      const registerUserDto: RegisterUserDto = {
        name: 'test',
        email: 'existing@example.com',
        password: 'testpassword',
      };

      const mockedExistingUser = { email: registerUserDto.email } as User;

      userService.getUser = jest.fn().mockResolvedValue(mockedExistingUser);

      await expect(
        authController.registerUser(registerUserDto),
      ).rejects.toThrowError(BadRequestException);

      expect(userService.getUser).toHaveBeenCalledWith({
        email: registerUserDto.email,
      });
    });
  });
  describe('loginUser', () => {
    it('should successfully login a user', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'testpassword',
      };

      const existingUser = {
        _id: 'someUserId',
        name: 'test',
        email: loginUserDto.email,
        password: await bcrypt.hash(loginUserDto.password, 10),
        refreshToken: '',
      };

      const mockTokens = {
        access_token: 'mockAccessToken',
        refresh_token: 'mockRefreshToken',
      };
      authService.updateRefreshToken = jest
        .fn()
        .mockReturnValue('fake_refresh_tọken');
      authService.login = jest.fn().mockReturnValue(mockTokens);

      userService.getUser = jest.fn().mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authController.loginUser(loginUserDto);

      expect(result).toEqual(mockTokens);

      expect(userService.getUser).toHaveBeenCalledWith({
        email: loginUserDto.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginUserDto.password,
        existingUser.password,
      );
      expect(authService.login).toHaveBeenCalledWith(existingUser);
    });

    it('should throw ForbiddenException if user is invalid', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'invalid@example.com',
        password: 'invalidpassword',
      };

      userService.getUser = jest.fn().mockResolvedValue(null);

      await expect(authController.loginUser(loginUserDto)).rejects.toThrowError(
        ForbiddenException,
      );

      expect(userService.getUser).toHaveBeenCalledWith({
        email: loginUserDto.email,
      });
    });

    it('should throw ForbiddenException if password is invalid', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'invalidpassword',
      };

      const existingUser = {
        _id: 'someUserId',
        name: 'test',
        email: loginUserDto.email,
        password: await bcrypt.hash('validpassword', 10), // Different password
        refreshToken: '',
      } as UserDocument;

      userService.getUser = jest.fn().mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authController.loginUser(loginUserDto)).rejects.toThrowError(
        ForbiddenException,
      );

      expect(userService.getUser).toHaveBeenCalledWith({
        email: loginUserDto.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginUserDto.password,
        existingUser.password,
      );
    });

    it('should throw InternalServerErrorException on AuthService error', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'testpassword',
      };

      const existingUser = {
        _id: 'someUserId',
        name: 'test',
        email: loginUserDto.email,
        password: await bcrypt.hash(loginUserDto.password, 10),
        refreshToken: '',
      } as UserDocument;

      userService.getUser = jest.fn().mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const errorMessage = 'Mocked AuthService error';
      authService.login = jest.fn().mockRejectedValue(new Error(errorMessage));

      await expect(authController.loginUser(loginUserDto)).rejects.toThrowError(
        InternalServerErrorException,
      );

      expect(userService.getUser).toHaveBeenCalledWith({
        email: loginUserDto.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginUserDto.password,
        existingUser.password,
      );
      expect(authService.login).toHaveBeenCalledWith(existingUser);
    });
  });
});
