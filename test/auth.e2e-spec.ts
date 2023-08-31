import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/auth/signup (POST)', async () => {
    const registerUserDto = {
      email: 'test@example.com',
      password: 'testpassword',
    };
    const response = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(registerUserDto)
      .expect(201);

    expect(response.body.email).toEqual(registerUserDto.email);
    // Perform more assertions as needed
  });

  // More e2e tests...
});
