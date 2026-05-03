import { memo } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Button, Chip, Text } from 'react-native-paper';

import { usePreferences } from '../contexts/preferences-context';
import type { Opportunity } from '../data/opportunities';

export const OpportunityCard = memo(function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const { paperTheme } = usePreferences();
  const c = paperTheme.colors;

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderRadius: paperTheme.roundness }]}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <Chip compact icon="office-building-outline" style={{ backgroundColor: c.surfaceVariant }}>
          {opportunity.provider}
        </Chip>
        {opportunity.deadline !== 'Rolling' ? (
          <View style={styles.deadlineRow}>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>Due</Text>
            <Text variant="labelMedium" style={{ color: c.primary }}>{opportunity.deadline}</Text>
          </View>
        ) : (
          <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>Rolling</Text>
        )}
      </View>

      <Text variant="titleMedium" style={[styles.title, { color: c.onSurface }]}>
        {opportunity.title}
      </Text>

      <Text variant="bodySmall" style={[styles.summary, { color: c.onSurfaceVariant }]}>
        {opportunity.summary}
      </Text>

      {opportunity.fundingAmount ? (
        <Text variant="labelLarge" style={[styles.funding, { color: c.primary }]}>
          {opportunity.fundingAmount}
        </Text>
      ) : null}

      {/* Meta chips */}
      <View style={styles.chipRow}>
        <Chip compact style={{ backgroundColor: c.surfaceVariant }}>{opportunity.category}</Chip>
        <Chip compact style={{ backgroundColor: c.surfaceVariant }}>{opportunity.region}</Chip>
        <Chip compact style={{ backgroundColor: c.surfaceVariant }}>{opportunity.level}</Chip>
        {opportunity.minAge || opportunity.maxAge ? (
          <Chip compact style={{ backgroundColor: c.surfaceVariant }}>
            Age {opportunity.minAge ?? ''}
            {opportunity.minAge && opportunity.maxAge ? '–' : ''}
            {opportunity.maxAge ?? (opportunity.minAge ? '+' : '')}
          </Chip>
        ) : null}
      </View>

      {/* Requirements */}
      {opportunity.requirements.length > 0 ? (
        <View style={styles.reqList}>
          {opportunity.requirements.slice(0, 2).map((req, i) => (
            <View key={i} style={styles.reqRow}>
              <Text style={[styles.bullet, { color: c.primary }]}>•</Text>
              <Text variant="bodySmall" style={[styles.reqText, { color: c.onSurfaceVariant }]}>{req}</Text>
            </View>
          ))}
          {opportunity.requirements.length > 2 ? (
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, opacity: 0.7 }}>
              +{opportunity.requirements.length - 2} more requirements
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button mode="contained" compact onPress={() => Linking.openURL(opportunity.url)}>
          View opportunity
        </Button>
        <Button mode="outlined" compact>Save</Button>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card:        { padding: 16 },
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  title:       { marginTop: 12, fontWeight: '700' },
  summary:     { marginTop: 6, lineHeight: 18 },
  funding:     { marginTop: 10 },
  chipRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  reqList:     { marginTop: 12, gap: 4 },
  reqRow:      { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bullet:      { fontSize: 12, marginTop: 2 },
  reqText:     { flex: 1 },
  actions:     { flexDirection: 'row', gap: 8, marginTop: 16 },
});
