import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';

import { AppScreen } from '@/src/components/AppScreen';
import { OpportunityCard } from '@/src/components/OpportunityCard';
import { opportunities } from '@/src/data/opportunities';

const filters = ['All', 'Scholarships', 'Fellowships', 'Exchange', 'Internships'] as const;
type Filter = (typeof filters)[number];

export default function OpportunitiesScreen() {
  const [selectedFilter, setSelectedFilter] = useState<Filter>('All');

  const filtered = useMemo(() => {
    if (selectedFilter === 'All') return opportunities;
    return opportunities.filter((item) => item.category === selectedFilter);
  }, [selectedFilter]);

  return (
    <AppScreen>
      <Card mode="contained">
        <Card.Content>
          <Text variant="headlineSmall">A clean public front door.</Text>
          <Text variant="bodyMedium" style={{ marginTop: 8 }}>
            This tab stays open without authentication. It is the acquisition surface for scholarships,
            grants, exchanges, internships, and other opportunities.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
            {filters.map((filter) => (
              <Chip
                key={filter}
                selected={selectedFilter === filter}
                onPress={() => setSelectedFilter(filter)}>
                {filter}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <View style={{ marginTop: 24, gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="titleLarge">Featured right now</Text>
            <Text variant="bodyMedium" style={{ opacity: 0.72, marginTop: 2 }}>
              {filtered.length} preview items in the current starter dataset
            </Text>
          </View>
          <Button compact mode="text">
            Future search
          </Button>
        </View>

        {filtered.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
      </View>
    </AppScreen>
  );
}
