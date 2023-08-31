import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('BlogController', () => {
  let controller: UserController;

  const mockUserService = {
    getAllUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAllUser => should return an array of user', async () => {
    //arrange
    const user = {
      id: Date.now(),
      title: 'Title',
      description: 'description',
    };
    const users = [user];
    jest.spyOn(mockUserService, 'getAllUsers').mockReturnValue(users);

    //act
    const result = await controller.getAllUsers();

    // assert
    expect(result).toEqual(users);
    expect(mockUserService.getAllUsers).toBeCalled();
  });
});
