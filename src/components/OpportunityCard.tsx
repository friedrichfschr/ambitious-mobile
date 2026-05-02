import { Linking, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';

import type { Opportunity } from '@/src/data/opportunities';

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <Card mode="contained">
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <Chip compact icon="earth">
            Public
          </Chip>
          <Text variant="bodySmall" style={{ opacity: 0.68 }}>
            Deadline {opportunity.deadline}
          </Text>
        </View>

        <Text variant="titleLarge" style={{ marginTop: 16 }}>
          {opportunity.title}
        </Text>
        <Text variant="bodyMedium" style={{ marginTop: 8 }}>
          {opportunity.summary}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          <Chip compact>{opportunity.category}</Chip>
          <Chip compact>{opportunity.region}</Chip>
          <Chip compact>{opportunity.level}</Chip>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
          <Button mode="contained" onPress={() => Linking.openURL(opportunity.url)}>
            Open
          </Button>
          <Button mode="text">Save later</Button>
        </View>
      </Card.Content>
    </Card>
  );
}
