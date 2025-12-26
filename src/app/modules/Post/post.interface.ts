import { Model, Types } from 'mongoose';
import { POST_STATUS } from './post.constants';

export interface TPostCreate {
  title: string;
  content: string;
  author: Types.ObjectId;
  images?: string[];
  status: (typeof POST_STATUS)[keyof typeof POST_STATUS];
}

export interface TPost extends TPostCreate {
  _id: string;
  likes: Types.ObjectId[];
  isDeleted: boolean;
}

export interface PostModel extends Model<TPost> {
  isPostExist(id: string): Promise<TPost>;
}

export type IPaginationOption = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
