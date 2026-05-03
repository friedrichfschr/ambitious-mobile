import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Chip,
  Divider,
  IconButton,
  Menu,
  Searchbar,
  Text,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OpportunityCard } from "@/src/components/OpportunityCard";
import {
  opportunities,
  type OpportunityCategory,
} from "@/src/data/opportunities";
import { usePreferences } from "@/src/contexts/preferences-context";

const CATEGORY_FILTERS = [
  "All",
  "Scholarships",
  "Fellowships",
  "Exchange",
  "Internships",
  "Grants",
  "Competitions",
] as const;
type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

const SORT_OPTIONS = [
  { key: "deadline", label: "Deadline (soonest)" },
  { key: "az", label: "A → Z" },
  { key: "funding", label: "Funding amount" },
] as const;
type SortKey = (typeof SORT_OPTIONS)[number]["key"];

export default function OpportunitiesScreen() {
  const { paperTheme } = usePreferences();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [sortKey, setSortKey] = useState<SortKey>("deadline");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? "Sort";

  const filtered = useMemo(() => {
    let list = opportunities;

    if (category !== "All") {
      list = list.filter((o) => o.category === category);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.provider.toLowerCase().includes(q) ||
          o.summary.toLowerCase().includes(q) ||
          o.tags.some((t) => t.toLowerCase().includes(q)) ||
          o.region.toLowerCase().includes(q),
      );
    }

    return [...list].sort((a, b) => {
      if (sortKey === "deadline") return a.deadlineMonth - b.deadlineMonth;
      if (sortKey === "az") return a.title.localeCompare(b.title);
      if (sortKey === "funding") {
        const fa = a.fundingAmount ? 1 : 0;
        const fb = b.fundingAmount ? 1 : 0;
        return fb - fa;
      }
      return 0;
    });
  }, [query, category, sortKey]);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: paperTheme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 32 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Search + Sort */}
      <View style={styles.searchRow}>
        <Searchbar
          placeholder="Search opportunities…"
          value={query}
          onChangeText={setQuery}
          style={[
            styles.searchBar,
            { backgroundColor: paperTheme.colors.surface },
          ]}
          inputStyle={{ fontSize: 14 }}
          elevation={0}
        />
        <Menu
          visible={sortMenuOpen}
          onDismiss={() => setSortMenuOpen(false)}
          anchor={
            <IconButton
              icon="sort-variant"
              mode="contained-tonal"
              onPress={() => setSortMenuOpen(true)}
            />
          }
        >
          {SORT_OPTIONS.map((opt) => (
            <Menu.Item
              key={opt.key}
              title={opt.label}
              trailingIcon={sortKey === opt.key ? "check" : undefined}
              onPress={() => {
                setSortKey(opt.key);
                setSortMenuOpen(false);
              }}
            />
          ))}
        </Menu>
      </View>

      {/* Category filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {CATEGORY_FILTERS.map((filter) => (
          <Chip
            key={filter}
            selected={category === filter}
            onPress={() => setCategory(filter)}
            style={
              category === filter
                ? { backgroundColor: paperTheme.colors.primary }
                : undefined
            }
            textStyle={
              category === filter
                ? { color: paperTheme.colors.onPrimary }
                : undefined
            }
          >
            {filter}
          </Chip>
        ))}
      </ScrollView>

      <Divider style={styles.divider} />

      {/* Results header */}
      <View style={styles.resultsHeader}>
        <Text
          variant="titleMedium"
          style={{ color: paperTheme.colors.onSurface, fontWeight: "700" }}
        >
          {filtered.length}{" "}
          {filtered.length === 1 ? "opportunity" : "opportunities"}
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: paperTheme.colors.onSurfaceVariant }}
        >
          sorted by {currentSortLabel.toLowerCase()}
        </Text>
      </View>

      {/* Cards */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text
            variant="bodyLarge"
            style={{
              color: paperTheme.colors.onSurfaceVariant,
              textAlign: "center",
            }}
          >
            No opportunities match your search.
          </Text>
          <Text
            variant="bodySmall"
            style={[
              styles.emptySubtext,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            Try a different keyword or category.
          </Text>
        </View>
      ) : (
        <View style={styles.cards}>
          {filtered.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 0 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  searchBar: { flex: 1, borderRadius: 12 },
  filterScroll: { marginHorizontal: -16, marginBottom: 12 },
  filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  divider: { marginBottom: 16 },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  cards: { gap: 12 },
  empty: { marginTop: 48, alignItems: "center" },
  emptySubtext: { textAlign: "center", marginTop: 4 },
});
