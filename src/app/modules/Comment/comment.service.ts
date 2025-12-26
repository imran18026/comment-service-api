/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { TComment, TCommentCreate } from './comment.interface';
import { Comment } from './comment.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { Post } from '../Post/post.model';

export type IFilter = {
  searchTerm?: string;
  [key: string]: any;
};

const createComment = async (payload: TCommentCreate) => {
  const { content, author, post, parentComment, replyingTo } = payload;

  // Check if post exists
  const postExists = await Post.findById(post);

  if (!postExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  let finalParentComment = parentComment;
  let finalReplyingTo = replyingTo;

  // Facebook-style flat structure logic
  if (parentComment) {
    const parentCommentDoc = await Comment.findById(parentComment);

    if (!parentCommentDoc) {
      throw new AppError(httpStatus.NOT_FOUND, 'Parent comment not found');
    }

    // If replying to a reply, flatten the structure
    // Set parent to the original top-level comment
    if (parentCommentDoc.parentComment) {
      finalParentComment = parentCommentDoc.parentComment;
      finalReplyingTo = parentComment; // Store who we're actually replying to
    } else {
      // Replying to a top-level comment
      finalParentComment = parentComment;
      finalReplyingTo = parentComment;
    }
  }

  const commentData = {
    content,
    author,
    post,
    parentComment: finalParentComment,
    replyingTo: finalReplyingTo,
  };

  const comment = await Comment.create(commentData);

  if (!comment) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Comment creation failed');
  }

  return comment;
};

const updateComment = async (
  id: string,
  userId: string,
  payload: Partial<TComment>,
) => {
  const { author, likes, ...rest } = payload;

  const comment = await Comment.findById(id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  if (comment.author.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to update this comment',
    );
  }

  const updatedComment = await Comment.findByIdAndUpdate(id, rest, {
    new: true,
  });

  if (!updatedComment) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Comment updating failed');
  }

  return updatedComment;
};

const getAllCommentsQuery = async (query: Record<string, unknown>) => {
  const commentQuery = new QueryBuilder(
    Comment.find({}).populate('author', 'fullName email image').populate('post', 'title'),
    query,
  )
    .search(['content'])
    .filter(['post', 'author'])
    .sort()
    .paginate()
    .fields();

  const result = await commentQuery.modelQuery;
  const meta = await commentQuery.countTotal();
  return { meta, result };
};

const getCommentById = async (id: string) => {
  const result = await Comment.findById(id)
    .populate('author', 'fullName email image')
    .populate('post', 'title');

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  return result;
};

const getCommentsByPostId = async (postId: string) => {
  const result = await Comment.find({ post: postId, parentComment: null })
    .populate('author', 'fullName email image')
    .sort({ createdAt: -1 });
  return result;
};

const getRepliesByCommentId = async (commentId: string) => {
  const result = await Comment.find({ parentComment: commentId })
    .populate('author', 'fullName email image')
    .sort({ createdAt: 1 });
  return result;
};

const deleteComment = async (id: string, userId: string, userRole: string) => {
  const comment = await Comment.findById(id)
    .populate('post', 'author')
    .populate('parentComment', 'author');

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Get IDs for comparison
  const commentAuthorId = comment.author.toString();
  const postAuthorId = (comment.post as any).author?.toString();
  const parentCommentAuthorId = comment.parentComment
    ? (comment.parentComment as any).author?.toString()
    : null;

  // Check authorization
  const isAdmin = userRole === 'admin';
  const isCommentOwner = commentAuthorId === userId;
  const isParentComment = !comment.parentComment; // Top-level comment
  const isReplyComment = !!comment.parentComment; // Reply to another comment

  // Authorization rules:
  // 1. ADMIN can delete any comment
  // 2. You can delete your OWN comment (whether parent or reply)
  // 3. If you are the POST owner → you can delete ONLY parent comments on your post (not replies)
  // 4. If you are the PARENT COMMENT owner → you can delete ONLY replies to your comment (not other parent comments)

  let canDelete = false;

  if (isAdmin) {
    // Admin can delete anything
    canDelete = true;
  } else if (isCommentOwner) {
    // You can delete your own comment (parent or reply)
    canDelete = true;
  } else if (isParentComment && postAuthorId === userId) {
    // Post owner can delete parent comments on their post
    canDelete = true;
  } else if (isReplyComment && parentCommentAuthorId === userId) {
    // Parent comment owner can delete replies to their comment
    canDelete = true;
  }

  if (!canDelete) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to delete this comment',
    );
  }

  // Delete the comment
  const commentDeleted = await Comment.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!commentDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Comment deleting failed');
  }

  // If deleting a parent comment, also delete all its child comments (replies)
  if (isParentComment) {
    await Comment.updateMany(
      { parentComment: id },
      { isDeleted: true }
    );
  }

  return commentDeleted;
};

const likeComment = async (commentId: string, userId: string) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const userIdStr = userId.toString();
  const isLiked = comment.likes.some((like) => like.toString() === userIdStr);

  let updatedComment;

  if (isLiked) {
    // Unlike the comment
    updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $pull: { likes: userId } },
      { new: true },
    );
  } else {
    // Like the comment
    updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $addToSet: { likes: userId } },
      { new: true },
    );
  }

  if (!updatedComment) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Comment like/unlike failed');
  }

  return updatedComment;
};

export const commentService = {
  createComment,
  getCommentById,
  getCommentsByPostId,
  getRepliesByCommentId,
  updateComment,
  deleteComment,
  getAllCommentsQuery,
  likeComment,
};
