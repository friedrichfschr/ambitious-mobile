export type FeedAuthor = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type FeedImage = {
  url: string;
  position: number;
};

export type FeedPost = {
  id: string;
  text: string;
  createdAt: string;
  editedAt: string | null;
  author: FeedAuthor;
  images: FeedImage[];
  mentions: FeedAuthor[];
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
};

export type FeedResponse = {
  posts: FeedPost[];
  nextCursor: string | null;
};

export type FeedComment = {
  id: string;
  postId: string;
  parentId: string | null;
  text: string;
  createdAt: string;
  editedAt: string | null;
  author: FeedAuthor;
  mentions: FeedAuthor[];
  likeCount: number;
  replyCount: number;
  isLikedByMe: boolean;
};

export type CommentsResponse = {
  comments: FeedComment[];
  nextCursor: string | null;
};
