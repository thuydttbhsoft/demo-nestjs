import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UserService } from '../src/user/user.service';
import { AuthService } from '../src/auth/auth.service';
import { User } from 'src/user/user.model';
import { RegisterUserDto } from 'src/auth/dto/registerUser.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { BlogService } from '../src/blog/blog.service';
// Mock bcrypt module
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userService, authService;
  let jwtService, blogService;
  const mockUserService = {
    getUser: jest.fn(),
    createUser: jest.fn(),
  };
  const mockAuthService = {
    updateRefreshToken: jest.fn(),
    validateUser: jest.fn(),
  };
  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockBlogService = {
    createBlog: jest.fn(),
    getAllBlogs: jest.fn(),
    getBlog: jest.fn(),
    updateBlog: jest.fn(),
    deleteBlog: jest.fn(),
  };
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: BlogService,
          useValue: mockBlogService,
        },
      ],
    }).compile();
    blogService = moduleFixture.get<BlogService>(BlogService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    authService = moduleFixture.get<AuthService>(AuthService);
    userService = moduleFixture.get<UserService>(UserService);
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    app.useLogger(new Logger());
  });

  describe('Auth', () => {
    const dto: RegisterUserDto = {
      name: 'test',
      email: 'existing@example.com',
      password: 'testpassword',
    };
    describe('Signup', () => {
      it('should throw exception if email empty', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signup')
          .send({
            password: dto.password,
          })
          .expect(400);
      });

      it('should throw if email exist', () => {
        const registerUserDto: RegisterUserDto = {
          name: 'test',
          email: 'existing@example.com',
          password: 'testpassword',
        };

        const mockedExistingUser = { email: registerUserDto.email } as User;

        userService.getUser = jest.fn().mockResolvedValue(mockedExistingUser);
        return request(app.getHttpServer())
          .post('/api/auth/signup')
          .send({
            email: dto.email,
          })
          .expect(400);
      });

      it('should throw if no body', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signup')
          .expect(400);
      });

      it('should signup', () => {
        const mockedExistingUser = null; // No existing user
        userService.getUser = jest.fn().mockResolvedValue(mockedExistingUser);
        userService.createUser = jest
          .fn()
          .mockResolvedValue({ ...dto } as User);
        return request(app.getHttpServer())
          .post('/api/auth/signup')
          .send(dto)
          .expect(201);
      });
    });
    describe('Login', () => {
      const existingUser = {
        _id: 'someUserId',
        name: 'test',
        email: dto.email,
        password: 'fake',
        refreshToken: '',
      };
      it('should throw exception if user empty', () => {
        authService.validateUser = jest.fn().mockResolvedValue(null);
        return request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: 'test@gmail.com',
          })
          .expect(401);
      });

      it('should signin', () => {
        authService.validateUser = jest.fn().mockResolvedValue(existingUser);
        userService.getUser = jest.fn().mockResolvedValue(existingUser);

        const mockTokens = {
          access_token: 'mockAccessToken',
          refresh_token: 'mockRefreshToken',
        };
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        authService.updateRefreshToken = jest
          .fn()
          .mockReturnValue('fake_refresh_tọken');
        authService.login = jest.fn().mockReturnValue(mockTokens);
        return request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: dto.email,
            password: dto.password,
          })
          .expect(201);
      });
    });
    describe('Blog', () => {
      const existingUser = {
        _id: 'someUserId',
        name: 'test',
        email: dto.email,
        password: 'fake',
        refreshToken: '',
      };
      //arrange
      const blog = {
        id: Date.now(),
        title: 'Title',
        description: 'description',
      };
      const blogs = [blog];
      const TOKEN = 'Fake_token';

      it('should return an array of blogs', () => {
        jwtService.verify = jest.fn().mockReturnValue({
          id: '',
          email: 'test@gmail.com',
        });
        userService.getUser = jest.fn().mockResolvedValue(existingUser);
        blogService.getAllBlogs = jest.fn().mockResolvedValue(blogs);
        return request(app.getHttpServer())
          .get('/api/blogs')
          .set('Authorization', `Bearer ${TOKEN}`)
          .expect(200)
          .expect(blogs);
      });

      it('should create blog', () => {
        jwtService.verify = jest.fn().mockReturnValue({
          id: '',
          email: 'test@gmail.com',
        });
        userService.getUser = jest.fn().mockResolvedValue(existingUser);
        blogService.createBlog = jest.fn().mockResolvedValue(blog);
        return request(app.getHttpServer())
          .post('/api/blogs')
          .set('Authorization', `Bearer ${TOKEN}`)
          .send(blog)
          .expect(201);
      });

      it('should validate create blog with title empty', () => {
        jwtService.verify = jest.fn().mockReturnValue({
          id: '',
          email: 'test@gmail.com',
        });
        userService.getUser = jest.fn().mockResolvedValue(existingUser);
        return request(app.getHttpServer())
          .post('/api/blogs')
          .set('Authorization', `Bearer ${TOKEN}`)
          .send({
            description: 'description',
          })
          .expect(400);
      });

      it('should update blog', () => {
        jwtService.verify = jest.fn().mockReturnValue({
          id: '',
          email: 'test@gmail.com',
        });
        userService.getUser = jest.fn().mockResolvedValue(existingUser);
        blogService.getBlog = jest.fn().mockResolvedValue(blog);
        blogService.updateBlog = jest.fn().mockResolvedValue(blog);
        return request(app.getHttpServer())
          .put('/api/blogs/370293hd3204dsq3qd')
          .set('Authorization', `Bearer ${TOKEN}`)
          .send(blog)
          .expect(200);
      });

      it('should Not Found Exception when update blog with id not exist', () => {
        jwtService.verify = jest.fn().mockReturnValue({
          id: '',
          email: 'test@gmail.com',
        });
        userService.getUser = jest.fn().mockResolvedValue(existingUser);
        blogService.getBlog = jest.fn().mockResolvedValue(null);
        return request(app.getHttpServer())
          .put('/api/blogs/370293hd3204dsq3qd')
          .set('Authorization', `Bearer ${TOKEN}`)
          .send(blog)
          .expect(404);
      });

      it('should delete blog', () => {
        jwtService.verify = jest.fn().mockReturnValue({
          id: '',
          email: 'test@gmail.com',
        });
        userService.getUser = jest.fn().mockResolvedValue(existingUser);
        blogService.getBlog = jest.fn().mockResolvedValue(blog);
        blogService.deleteBlog = jest.fn().mockResolvedValue(true);
        return request(app.getHttpServer())
          .delete('/api/blogs/370293hd3204dsq3qd')
          .set('Authorization', `Bearer ${TOKEN}`)
          .send(blog)
          .expect(200);
      });

      it('should Not Found Exception when delete blog with id not exist', () => {
        jwtService.verify = jest.fn().mockReturnValue({
          id: '',
          email: 'test@gmail.com',
        });
        userService.getUser = jest.fn().mockResolvedValue(existingUser);
        blogService.getBlog = jest.fn().mockResolvedValue(null);
        return request(app.getHttpServer())
          .delete('/api/blogs/370293hd3204dsq3qd')
          .set('Authorization', `Bearer ${TOKEN}`)
          .send(blog)
          .expect(404);
      });
    });
  });
  afterAll(async () => {
    await app.close();
  });
});
