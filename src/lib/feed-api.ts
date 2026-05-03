import { apiRequest } from './api';
import type { CommentsResponse, FeedComment, FeedPost, FeedResponse } from '../types/feed';

export const feedApi = {
  getFeed(params?: { cursor?: string; limit?: number }, accessToken?: string) {
    const query = new URLSearchParams();
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString() ? `?${query}` : '';
    return apiRequest<FeedResponse>(`/api/feed${qs}`, {
      method: 'GET',
      token: accessToken,
    });
  },

  createPost(formData: FormData, accessToken: string) {
    return apiRequest<{ post: FeedPost }>('/api/posts', {
      method: 'POST',
      body: formData,
      token: accessToken,
    });
  },

  toggleLike(postId: string, accessToken: string) {
    return apiRequest<{ liked: boolean }>(`/api/posts/${postId}/like`, {
      method: 'POST',
      token: accessToken,
    });
  },

  getComments(postId: string, cursor?: string, accessToken?: string) {
    const q = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
    return apiRequest<CommentsResponse>(`/api/posts/${postId}/comments${q}`, {
      method: 'GET',
      token: accessToken,
    });
  },

  createComment(postId: string, text: string, accessToken: string) {
    return apiRequest<{ comment: FeedComment }>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
      token: accessToken,
    });
  },
};

export const usersApi = {
  checkUsername(username: string) {
    return apiRequest<{ username: string; available: boolean }>(
      `/api/users/check-username?username=${encodeURIComponent(username)}`,
      { method: 'GET' },
    );
  },
};
