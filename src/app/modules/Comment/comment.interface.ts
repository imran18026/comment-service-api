import { Model, Types } from 'mongoose';

export interface TCommentCreate {
  content: string;
  author: Types.ObjectId;
  post: Types.ObjectId;
  parentComment?: Types.ObjectId;
  replyingTo?: Types.ObjectId;
}

export interface TComment extends TCommentCreate {
  _id: string;
  likes: Types.ObjectId[];
  isDeleted: boolean;
}

export interface CommentModel extends Model<TComment> {
  isCommentExist(id: string): Promise<TComment>;
}

export type IPaginationOption = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
