import { z } from 'zod';

const createCommentValidationSchema = z.object({
  body: z.object({
    content: z.string().min(1, { message: 'Content is required' }),
    post: z.string().min(1, { message: 'Post ID is required' }),
    parentComment: z.string().optional(),
    replyingTo: z.string().optional(),
  }),
});

const updateCommentValidationSchema = z.object({
  body: z.object({
    content: z.string().min(1, { message: 'Content is required' }).optional(),
  }),
});

export const commentValidation = {
  createCommentValidationSchema,
  updateCommentValidationSchema,
};
