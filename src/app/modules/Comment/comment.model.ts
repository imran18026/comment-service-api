import { model, Schema } from 'mongoose';
import { CommentModel, TComment } from './comment.interface';

const commentSchema = new Schema<TComment>(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    replyingTo: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
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
commentSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

commentSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

commentSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

commentSchema.statics.isCommentExist = async function (id: string) {
  return await Comment.findById(id);
};

export const Comment = model<TComment, CommentModel>('Comment', commentSchema);
