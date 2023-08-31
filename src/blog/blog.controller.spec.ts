import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BlogController } from './blog.controller';
import { Blog } from './blog.model';
import { BlogService } from './blog.service';
import { BlogDto } from './dto/blog.dto';

describe('BlogController', () => {
  let controller: BlogController;

  const mockBlogService = {
    createBlog: jest.fn(),
    getAllBlogs: jest.fn(),
    getBlog: jest.fn(),
    updateBlog: jest.fn(),
    deleteBlog: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [
        {
          provide: BlogService,
          useValue: mockBlogService,
        },
      ],
    }).compile();

    controller = module.get<BlogController>(BlogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create => should create a new user by a given data', async () => {
    // arrange
    const createBlogDto = {
      title: 'Title',
      description: 'description',
    } as BlogDto;

    const blog = {
      id: Date.now(),
      title: 'Title',
      description: 'description',
      author: {
        id: 'test_id',
        name: 'test',
        email: 'test@gmail.com',
        password: '',
        refreshToken: '',
      },
    } as Blog;

    jest.spyOn(mockBlogService, 'createBlog').mockReturnValue(blog);

    const req = {
      send: jest.fn((x) => x),
      user: { id: 'test_id' },
    } as unknown as Request;
    // act
    const result = await controller.createBlog(createBlogDto, req);

    // assert
    expect(mockBlogService.createBlog).toBeCalled();

    expect(result).toEqual(blog);
  });

  it('getAllBlog => should return an array of blog', async () => {
    //arrange
    const blog = {
      id: Date.now(),
      title: 'Title',
      description: 'description',
    };
    const blogs = [blog];
    jest.spyOn(mockBlogService, 'getAllBlogs').mockReturnValue(blogs);

    //act
    const result = await controller.getAllBlog();

    // assert
    expect(result).toEqual(blogs);
    expect(mockBlogService.getAllBlogs).toBeCalled();
  });

  it('updateBlog => should find a blog by a given id and update its data', async () => {
    //arrange
    const id = '1';
    const updateUserDto = {
      title: 'Title update',
      description: 'description update',
    } as BlogDto;

    const blog = {
      id: 1,
      title: 'Title',
      description: 'description',
    };

    jest.spyOn(mockBlogService, 'updateBlog').mockReturnValue({
      blog,
      ...updateUserDto,
    });
    jest.spyOn(mockBlogService, 'getBlog').mockReturnValue(blog);

    //act
    const result = await controller.updateBlog(id, updateUserDto);

    expect(result.title).toBe(updateUserDto.title);
    expect(result.description).toBe(updateUserDto.description);
    expect(mockBlogService.updateBlog).toBeCalled();
    expect(mockBlogService.updateBlog).toBeCalledWith(id, updateUserDto);
  });

  it('should throw NotFoundException if blog is not found', async () => {
    const blogId = 'nonExistentId';
    const updateUserDto = {
      title: 'Title update',
      description: 'description update',
    } as BlogDto;

    const blog = {
      id: 1,
      title: 'Title',
      description: 'description',
    };

    jest.spyOn(mockBlogService, 'updateBlog').mockReturnValue(blog);
    jest.spyOn(mockBlogService, 'getBlog').mockReturnValue(null);

    await expect(
      controller.updateBlog(blogId, updateUserDto),
    ).rejects.toThrowError(NotFoundException);
  });

  it('remove => should find a blog by a given id, remove and then return Number of affected rows', async () => {
    const id = '1';
    const blog = {
      id: 1,
      title: 'Title',
      description: 'description',
    };
    jest.spyOn(mockBlogService, 'getBlog').mockReturnValue(blog);

    jest.spyOn(mockBlogService, 'deleteBlog').mockReturnValue({
      deletedCount: 1,
    });

    //act
    const result = await controller.deleteBlog(id);

    expect(result.message).toEqual('Blog Deleted');
    expect(result.status).toEqual('success');
    expect(mockBlogService.deleteBlog).toBeCalled();
    expect(mockBlogService.deleteBlog).toBeCalledWith(id);
  });
});
