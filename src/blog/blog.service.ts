import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogDto } from './dto/blog.dto';
import { Blog, BlogDocument } from './blog.model';
import { modelsName } from 'src/common/constants/modelsName';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(modelsName.BLOG)
    private readonly blogModel: Model<BlogDocument>,
  ) {}

  async getAllBlogs(): Promise<Blog[]> {
    return this.blogModel.find().populate('author');
  }

  async createBlog(blog: BlogDto): Promise<Blog> {
    return this.blogModel.create(blog);
  }

  async updateBlog(id: string, blog: BlogDto): Promise<Blog> {
    return this.blogModel.findOneAndUpdate({ _id: id }, blog, { new: true });
  }

  async getBlog(query: object): Promise<Blog> {
    return this.blogModel.findOne(query);
  }

  async deleteBlog(id: string): Promise<any> {
    return this.blogModel.deleteOne({ _id: id });
  }
}
