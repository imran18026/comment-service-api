import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { postService } from './post.service';
import sendResponse from '../../utils/sendResponse';
import { storeFile } from '../../utils/fileHelper';
import httpStatus from 'http-status';

const createPost = catchAsync(async (req: Request, res: Response) => {
  const postData = {
    ...req.body,
    author: req.user?.userId,
  };

  if (req.files && Array.isArray(req.files)) {
    postData.images = req.files.map((file: any) =>
      storeFile('posts', file.filename),
    );
  }

  const newPost = await postService.createPost(postData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post created successfully',
    data: newPost,
  });
});

const getAllPosts = catchAsync(async (req, res) => {
  const result = await postService.getAllPostsQuery(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'Posts retrieved successfully!!',
  });
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
  const result = await postService.getPostById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post fetched successfully',
    data: result,
  });
});

const getMyPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await postService.getMyPosts(req?.user?.userId, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My posts fetched successfully',
    meta: result.meta,
    data: result.result,
  });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
  if (req.files && Array.isArray(req.files)) {
    req.body.images = req.files.map((file: any) =>
      storeFile('posts', file.filename),
    );
  }

  const result = await postService.updatePost(
    req.params.id,
    req.user?.userId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post updated successfully',
    data: result,
  });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const result = await postService.deletePost(req.params.id, req.user?.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post deleted successfully',
    data: result,
  });
});

const likePost = catchAsync(async (req: Request, res: Response) => {
  const result = await postService.likePost(req.params.id, req.user?.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post like/unlike successfully',
    data: result,
  });
});

export const postController = {
  createPost,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
  getAllPosts,
  likePost,
};
