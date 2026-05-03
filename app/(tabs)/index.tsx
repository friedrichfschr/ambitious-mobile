import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Avatar, Divider, Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useAuth } from '@/src/contexts/auth-context';
import { usePreferences } from '@/src/contexts/preferences-context';
import { feedApi } from '@/src/lib/feed-api';
import type { FeedComment, FeedPost } from '@/src/types/feed';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function initials(name: string | null | undefined, fallback: string): string {
  return (name || fallback || '?').slice(0, 2).toUpperCase();
}

// ─── Comments Modal ────────────────────────────────────────────────────────────

function CommentsModal({ post, onClose }: { post: FeedPost; onClose: () => void }) {
  const { accessToken } = useAuth();
  const { paperTheme } = usePreferences();
  const c = paperTheme.colors;

  const [comments, setComments] = useState<FeedComment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    feedApi.getComments(post.id, undefined, accessToken ?? undefined)
      .then((res) => { setComments(res.comments); setNextCursor(res.nextCursor); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [post.id]);

  async function loadMore() {
    if (!nextCursor) return;
    const res = await feedApi.getComments(post.id, nextCursor, accessToken ?? undefined);
    setComments((prev) => [...prev, ...res.comments]);
    setNextCursor(res.nextCursor);
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || !accessToken || sending) return;
    setSending(true);
    try {
      const res = await feedApi.createComment(post.id, text, accessToken);
      setComments((prev) => [res.comment, ...prev]);
      setDraft('');
    } catch { /* ignore */ } finally {
      setSending(false);
    }
  }

  function renderComment({ item }: { item: FeedComment }) {
    const label = initials(item.author.displayName, item.author.username);
    return (
      <View style={styles.commentRow}>
        <Avatar.Text
          size={32}
          label={label}
          style={{ backgroundColor: c.primaryContainer }}
          labelStyle={{ color: c.onPrimaryContainer, fontSize: 11 }}
        />
        <View style={styles.commentBubble}>
          <View style={styles.commentHeader}>
            <Text variant="labelMedium" style={{ color: c.onSurface, fontWeight: '600' }}>
              {item.author.displayName || item.author.username}
            </Text>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>
              {formatRelativeTime(item.createdAt)}
            </Text>
          </View>
          <Text variant="bodyMedium" style={{ color: c.onSurface, lineHeight: 20, marginTop: 2 }}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.modalRoot, { backgroundColor: c.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Handle + header */}
        <View style={[styles.modalHeader, { borderBottomColor: c.outlineVariant }]}>
          <View style={[styles.dragHandle, { backgroundColor: c.outlineVariant }]} />
          <View style={styles.modalTitleRow}>
            <Text variant="titleMedium" style={{ color: c.onSurface, fontWeight: '700' }}>
              Comments
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <MaterialCommunityIcons name="close" size={22} color={c.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={c.primary} />
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(c) => c.id}
            renderItem={renderComment}
            contentContainerStyle={styles.commentList}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text variant="bodyMedium" style={{ color: c.onSurfaceVariant, textAlign: 'center' }}>
                  No comments yet. Be the first to comment!
                </Text>
              </View>
            }
          />
        )}

        {/* Composer */}
        {accessToken ? (
          <View style={[styles.commentComposer, { backgroundColor: c.surface, borderTopColor: c.outlineVariant }]}>
            <RNTextInput
              ref={inputRef}
              value={draft}
              onChangeText={setDraft}
              placeholder="Add a comment…"
              placeholderTextColor={c.onSurfaceVariant}
              multiline
              style={[styles.commentInput, { color: c.onSurface, backgroundColor: c.surfaceVariant }]}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!draft.trim() || sending}
              style={[styles.commentSendBtn, { backgroundColor: draft.trim() ? c.primary : c.surfaceVariant }]}
              activeOpacity={0.75}>
              <MaterialCommunityIcons name="send" size={16} color={draft.trim() ? c.onPrimary : c.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.commentComposer, { backgroundColor: c.surface, borderTopColor: c.outlineVariant }]}>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, flex: 1, textAlign: 'center' }}>
              Sign in to comment
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  onLike,
  onComment,
}: {
  post: FeedPost;
  onLike: (id: string) => void;
  onComment: (post: FeedPost) => void;
}) {
  const { paperTheme } = usePreferences();
  const c = paperTheme.colors;

  const label = initials(post.author.displayName, post.author.username);

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <View style={styles.cardHeader}>
        <Avatar.Text
          size={38}
          label={label}
          style={{ backgroundColor: c.primaryContainer }}
          labelStyle={{ color: c.onPrimaryContainer, fontSize: 14 }}
        />
        <View style={styles.authorBlock}>
          <Text variant="titleSmall" style={{ color: c.onSurface, fontWeight: '600' }}>
            {post.author.displayName || post.author.username}
          </Text>
          <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>
            @{post.author.username} · {formatRelativeTime(post.createdAt)}
          </Text>
        </View>
      </View>

      <Text variant="bodyMedium" style={[styles.postText, { color: c.onSurface }]}>
        {post.text}
      </Text>

      <View style={styles.cardFooter}>
        <TouchableOpacity onPress={() => onLike(post.id)} style={styles.footerBtn} activeOpacity={0.7}>
          <MaterialCommunityIcons
            name={post.isLikedByMe ? 'heart' : 'heart-outline'}
            size={18}
            color={post.isLikedByMe ? '#E05C6A' : c.onSurfaceVariant}
          />
          <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginLeft: 4 }}>
            {post.likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onComment(post)} style={styles.footerBtn} activeOpacity={0.7}>
          <MaterialCommunityIcons name="comment-outline" size={18} color={c.onSurfaceVariant} />
          <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginLeft: 4 }}>
            {post.commentCount}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Feed screen ──────────────────────────────────────────────────────────────

export default function FeedScreen() {
  const { accessToken } = useAuth();
  const { paperTheme } = usePreferences();
  const c = paperTheme.colors;

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<FeedPost | null>(null);

  const isFetchingMore = useRef(false);

  const loadFeed = useCallback(async (cursor?: string) => {
    try {
      const res = await feedApi.getFeed(cursor ? { cursor } : undefined, accessToken ?? undefined);
      if (cursor) setPosts((prev) => [...prev, ...res.posts]);
      else setPosts(res.posts);
      setNextCursor(res.nextCursor);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    }
  }, [accessToken]);

  useEffect(() => {
    setLoading(true);
    loadFeed().finally(() => setLoading(false));
  }, [loadFeed]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }

  async function handleLoadMore() {
    if (!nextCursor || loadingMore || isFetchingMore.current) return;
    isFetchingMore.current = true;
    setLoadingMore(true);
    await loadFeed(nextCursor);
    setLoadingMore(false);
    isFetchingMore.current = false;
  }

  function handleLike(postId: string) {
    if (!accessToken) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLikedByMe: !p.isLikedByMe, likeCount: p.isLikedByMe ? p.likeCount - 1 : p.likeCount + 1 }
          : p,
      ),
    );
    feedApi.toggleLike(postId, accessToken).catch(() => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLikedByMe: !p.isLikedByMe, likeCount: p.isLikedByMe ? p.likeCount - 1 : p.likeCount + 1 }
            : p,
        ),
      );
    });
  }

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: c.background, flex: 1 }]}>
        <ActivityIndicator color={c.primary} size="large" />
      </View>
    );
  }

  if (error && posts.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: c.background, flex: 1 }]}>
        <MaterialCommunityIcons name="wifi-off" size={40} color={c.onSurfaceVariant} />
        <Text variant="bodyMedium" style={{ color: c.onSurfaceVariant, marginTop: 12, textAlign: 'center' }}>
          {error}
        </Text>
        <TouchableOpacity onPress={handleRefresh} style={{ marginTop: 16 }}>
          <Text variant="labelLarge" style={{ color: c.primary }}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <PostCard post={item} onLike={handleLike} onComment={setActivePost} />
        )}
        contentContainerStyle={[styles.list, { backgroundColor: c.background }]}
        style={{ backgroundColor: c.background }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ItemSeparatorComponent={() => <Divider style={{ marginHorizontal: 16 }} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text variant="bodyMedium" style={{ color: c.onSurfaceVariant, textAlign: 'center' }}>
              No posts yet. Be the first to share something!
            </Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={c.primary} style={{ paddingVertical: 20 }} /> : null
        }
      />

      {activePost && (
        <CommentsModal post={activePost} onClose={() => setActivePost(null)} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  list:        { flexGrow: 1, paddingVertical: 8 },
  centered:    { alignItems: 'center', justifyContent: 'center', padding: 32, minHeight: 300 },

  card:        { paddingHorizontal: 16, paddingVertical: 14 },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  authorBlock: { flex: 1 },
  postText:    { lineHeight: 22 },
  cardFooter:  { flexDirection: 'row', gap: 20, marginTop: 12 },
  footerBtn:   { flexDirection: 'row', alignItems: 'center' },

  // Comments modal
  modalRoot:       { flex: 1 },
  modalHeader:     { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  dragHandle:      { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 14 },
  modalTitleRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commentList:     { padding: 16, flexGrow: 1 },

  commentRow:      { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  commentBubble:   { flex: 1 },
  commentHeader:   { flexDirection: 'row', gap: 8, alignItems: 'center' },

  commentComposer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  commentInput: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 9 : 7,
    fontSize: 15,
    maxHeight: 100,
  },
  commentSendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
