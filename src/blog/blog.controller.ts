import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { Blog } from './blog.model';
import { BlogService } from './blog.service';
import { BlogDto } from './dto/blog.dto';

@Controller('api/blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('')
  async getAllBlog(): Promise<Blog[]> {
    try {
      const result = await this.blogService.getAllBlogs();
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('')
  async createBlog(@Body() blogDto: BlogDto, @Request() req): Promise<Blog> {
    try {
      const blog = await this.blogService.createBlog({
        ...blogDto,
        author: req.user.id,
      });

      return blog;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Put('/:id')
  async updateBlog(
    @Param('id') id: string,
    @Body() blogDto: BlogDto,
  ): Promise<Blog> {
    // Check if Blog already exists
    const existingBlog = await this.blogService.getBlog({
      _id: id,
    });
    if (!existingBlog) {
      throw new NotFoundException('Blog not found.');
    }
    try {
      const blog = await this.blogService.updateBlog(id, blogDto);

      return blog;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete('/:id')
  async deleteBlog(
    @Param('id') id: string,
  ): Promise<{ status: string; message: string }> {
    // Check if Blog already exists
    const existingBlog = await this.blogService.getBlog({
      _id: id,
    });
    if (!existingBlog) throw new NotFoundException('Blog not found.');
    try {
      await this.blogService.deleteBlog(id);

      return {
        status: 'success',
        message: 'Blog Deleted',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
