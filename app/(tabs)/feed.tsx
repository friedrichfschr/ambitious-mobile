import { View } from 'react-native';
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
      <View style={{ gap: 16 }}>
        {feedPreviewPosts.map((post) => (
          <Card key={post.id} mode="contained">
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="labelLarge">{post.community}</Text>
                <Text variant="bodySmall" style={{ opacity: 0.65 }}>
                  {post.timestamp}
                </Text>
              </View>
              <Text variant="titleMedium" style={{ marginTop: 12 }}>
                {post.title}
              </Text>
              <Text variant="bodyMedium" style={{ marginTop: 8 }}>
                {post.preview}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
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
