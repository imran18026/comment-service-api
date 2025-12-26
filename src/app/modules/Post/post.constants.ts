export const POST_STATUS = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
} as const;

export const PostStatus = Object.values(POST_STATUS);
