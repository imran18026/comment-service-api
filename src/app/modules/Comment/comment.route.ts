import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constants';
import { commentValidation } from './comment.validation';
import { commentController } from './comment.controller';

export const CommentRoutes = Router();

CommentRoutes.post(
  '/create',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validateRequest(commentValidation?.createCommentValidationSchema),
  commentController.createComment,
)
  .get('/', commentController.getAllComments)
  .get('/:id', commentController.getCommentById)
  .get('/post/:postId', commentController.getCommentsByPostId)
  .get('/:commentId/replies', commentController.getRepliesByCommentId)
  .patch(
    '/:id',
    auth(USER_ROLE.ADMIN, USER_ROLE.USER),
    validateRequest(commentValidation?.updateCommentValidationSchema),
    commentController.updateComment,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.ADMIN, USER_ROLE.USER),
    commentController.deleteComment,
  )
  .patch(
    '/:id/like',
    auth(USER_ROLE.ADMIN, USER_ROLE.USER),
    commentController.likeComment,
  );
