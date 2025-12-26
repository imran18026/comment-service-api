/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { TPost, TPostCreate } from './post.interface';
import { Post } from './post.model';
import QueryBuilder from '../../builder/QueryBuilder';

export type IFilter = {
  searchTerm?: string;
  [key: string]: any;
};

const createPost = async (payload: TPostCreate) => {
  const { title, content, author, images, status } = payload;

  const postData = {
    title,
    content,
    author,
    images,
    status,
  };

  const post = await Post.create(postData);

  if (!post) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Post creation failed');
  }

  return post;
};

const updatePost = async (
  id: string,
  userId: string,
  payload: Partial<TPost>,
) => {
  const { author, likes, ...rest } = payload;

  const post = await Post.findById(id);

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.author.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to update this post',
    );
  }

  const updatedPost = await Post.findByIdAndUpdate(id, rest, { new: true });

  if (!updatedPost) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Post updating failed');
  }

  return updatedPost;
};

const getAllPostsQuery = async (query: Record<string, unknown>) => {
  const postQuery = new QueryBuilder(
    Post.find({}).populate('author', 'fullName email image'),
    query,
  )
    .search(['title', 'content'])
    .filter(['status', 'author'])
    .sort()
    .paginate()
    .fields();

  const result = await postQuery.modelQuery;
  const meta = await postQuery.countTotal();
  return { meta, result };
};

const getPostById = async (id: string) => {
  const result = await Post.findById(id).populate(
    'author',
    'fullName email image',
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }
  return result;
};

const getMyPosts = async (authorId: string, query: Record<string, unknown>) => {
  const postQuery = new QueryBuilder(
    Post.find({ author: authorId }).populate('author', 'fullName email image'),
    query,
  )
    .search(['title', 'content'])
    .filter(['status'])
    .sort()
    .paginate()
    .fields();

  const result = await postQuery.modelQuery;
  const meta = await postQuery.countTotal();
  return { meta, result };
};

const deletePost = async (id: string, userId: string) => {
  const post = await Post.findById(id);

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.author.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to delete this post',
    );
  }

  const postDeleted = await Post.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!postDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Post deleting failed');
  }

  return postDeleted;
};

const likePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  const userIdStr = userId.toString();
  const isLiked = post.likes.some((like) => like.toString() === userIdStr);

  let updatedPost;

  if (isLiked) {
    // Unlike the post
    updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true },
    );
  } else {
    // Like the post
    updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: true },
    );
  }

  if (!updatedPost) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Post like/unlike failed');
  }

  return updatedPost;
};

export const postService = {
  createPost,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
  getAllPostsQuery,
  likePost,
};
