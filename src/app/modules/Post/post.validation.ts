import { z } from 'zod';
import { POST_STATUS } from './post.constants';

const createPostValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    content: z.string().min(1, { message: 'Content is required' }),
    images: z.array(z.string()).optional(),
    status: z
      .enum([POST_STATUS.PUBLISHED, POST_STATUS.DRAFT])
      .default(POST_STATUS.PUBLISHED),
  }),
});

const updatePostValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }).optional(),
    content: z.string().min(1, { message: 'Content is required' }).optional(),
    images: z.array(z.string()).optional(),
    status: z.enum([POST_STATUS.PUBLISHED, POST_STATUS.DRAFT]).optional(),
  }),
});

export const postValidation = {
  createPostValidationSchema,
  updatePostValidationSchema,
};
