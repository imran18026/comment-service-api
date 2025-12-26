import { model, Schema } from 'mongoose';
import { POST_STATUS, PostStatus } from './post.constants';
import { PostModel, TPost } from './post.interface';

const postSchema = new Schema<TPost>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: PostStatus,
      default: POST_STATUS.PUBLISHED,
    },
    likes: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

// filter out deleted documents
postSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

postSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

postSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

postSchema.statics.isPostExist = async function (id: string) {
  return await Post.findById(id);
};

export const Post = model<TPost, PostModel>('Post', postSchema);
