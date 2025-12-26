import { Router } from 'express';
import auth from '../../middleware/auth';
import fileUpload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constants';
import { postValidation } from './post.validation';
import { postController } from './post.controller';
const upload = fileUpload('./public/uploads/posts');

export const PostRoutes = Router();

PostRoutes.post(
  '/create',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  upload.array('images', 5),
  parseData(),
  validateRequest(postValidation?.createPostValidationSchema),
  postController.createPost,
)
  .get(
    '/my-posts',
    auth(USER_ROLE.ADMIN, USER_ROLE.USER),
    postController.getMyPosts,
  )
  .get('/', postController.getAllPosts)
  .get('/:id', postController.getPostById)
  .patch(
    '/:id',
    auth(USER_ROLE.ADMIN, USER_ROLE.USER),
    upload.array('images', 5),
    parseData(),
    validateRequest(postValidation?.updatePostValidationSchema),
    postController.updatePost,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.ADMIN, USER_ROLE.USER),
    postController.deletePost,
  )
  .patch(
    '/:id/like',
    auth(USER_ROLE.ADMIN, USER_ROLE.USER),
    postController.likePost,
  );
