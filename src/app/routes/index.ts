import { Router } from 'express';

import { AuthRoutes } from '../modules/Auth/auth.route';
import { PostRoutes } from '../modules/Post/post.route';
import { userRoutes } from '../modules/user/user.route';
import { CommentRoutes } from '../modules/Comment/comment.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/posts',
    route: PostRoutes,
  },
  {
    path: '/comments',
    route: CommentRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
