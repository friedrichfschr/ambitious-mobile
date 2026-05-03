import { StyleSheet, View } from 'react-native';
import { Card, Chip, Text } from 'react-native-paper';

import { AppScreen } from '@/src/components/AppScreen';
import { AuthGate } from '@/src/components/AuthGate';
import { useAuth } from '@/src/contexts/auth-context';
import { feedPreviewPosts } from '@/src/data/opportunities';

export default function FeedScreen() {
  const { user } = useAuth();

  if (!user) {
    return (
      <AppScreen>
        <AuthGate
          title="Sign in to access the community"
          description="The feed/forum is for authenticated members only. That keeps posting, saving, moderation, and direct follow-up tied to real accounts."
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={styles.list}>
        {feedPreviewPosts.map((post) => (
          <Card key={post.id} mode="contained">
            <Card.Content>
              <View style={styles.postHeader}>
                <Text variant="labelLarge">{post.community}</Text>
                <Text variant="bodySmall" style={styles.timestamp}>
                  {post.timestamp}
                </Text>
              </View>
              <Text variant="titleMedium" style={styles.postTitle}>
                {post.title}
              </Text>
              <Text variant="bodyMedium" style={styles.postPreview}>
                {post.preview}
              </Text>
              <View style={styles.tagRow}>
                {post.tags.map((tag) => (
                  <Chip key={tag} compact>
                    {tag}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list:        { gap: 16 },
  postHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timestamp:   { opacity: 0.65 },
  postTitle:   { marginTop: 12 },
  postPreview: { marginTop: 8 },
  tagRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
});
