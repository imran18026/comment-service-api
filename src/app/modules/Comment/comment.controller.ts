import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { commentService } from './comment.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

const createComment = catchAsync(async (req: Request, res: Response) => {
  const commentData = {
    ...req.body,
    author: req.user?.userId,
  };

  const newComment = await commentService.createComment(commentData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment created successfully',
    data: newComment,
  });
});

const getAllComments = catchAsync(async (req, res) => {
  const result = await commentService.getAllCommentsQuery(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'Comments retrieved successfully!!',
  });
});

const getCommentById = catchAsync(async (req: Request, res: Response) => {
  const result = await commentService.getCommentById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment fetched successfully',
    data: result,
  });
});

const getCommentsByPostId = catchAsync(async (req: Request, res: Response) => {
  const result = await commentService.getCommentsByPostId(req.params.postId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comments fetched successfully',
    data: result,
  });
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const result = await commentService.updateComment(
    req.params.id,
    req.user?.userId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment updated successfully',
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const result = await commentService.deleteComment(
    req.params.id,
    req.user?.userId,
    req.user?.role,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment deleted successfully',
    data: result,
  });
});

const getRepliesByCommentId = catchAsync(
  async (req: Request, res: Response) => {
    const result = await commentService.getRepliesByCommentId(
      req.params.commentId,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Replies fetched successfully',
      data: result,
    });
  },
);

const likeComment = catchAsync(async (req: Request, res: Response) => {
  const result = await commentService.likeComment(
    req.params.id,
    req.user?.userId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment like/unlike successfully',
    data: result,
  });
});

export const commentController = {
  createComment,
  getCommentById,
  getCommentsByPostId,
  getRepliesByCommentId,
  updateComment,
  deleteComment,
  getAllComments,
  likeComment,
};
