/* ==========================================================================
   ResourcesScreen.js - career guides with a category filter and a reader
   ========================================================================== */

import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Sheet from '../components/Sheet';
import { Button, Card, ChipRow, Empty, ErrorNotice, Loading, PageTitle, Tag } from '../components/ui';
import { categories } from '../lib/careerhub';
import { useApp } from '../state/AppContext';
import { colors } from '../theme';

export default function ResourcesScreen() {
  const { resources, reloadResources } = useApp();
  const [category, setCategory] = useState('All');
  const [article, setArticle] = useState(null);

  const visible = useMemo(
    () =>
      resources.items.filter((item) => category === 'All' || item.category === category),
    [resources.items, category]
  );
  const options = useMemo(() => categories(resources.items), [resources.items]);

  const header = (
    <View>
      <PageTitle
        title="Career Resources"
        subtitle="Practical guidance for applications, interviews and planning your next step."
      />
      {resources.status === 'ready' && (
        <View style={styles.filters}>
          <ChipRow options={options} selected={category} onSelect={setCategory} label="Category" />
          <Text style={styles.count} accessibilityLiveRegion="polite">
            {visible.length} of {resources.items.length} resources shown.
          </Text>
        </View>
      )}
    </View>
  );

  let empty = (
    <View style={styles.cardWrap}>
      <Empty message="No resources in that category yet." />
    </View>
  );
  if (resources.status === 'loading') {
    empty = <Loading message="Loading resources" />;
  } else if (resources.status === 'error') {
    empty = (
      <View style={styles.notice}>
        <ErrorNotice message={resources.error} onRetry={reloadResources} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <Card>
              <Text style={styles.icon} importantForAccessibility="no">{item.icon}</Text>
              <Text style={styles.title} accessibilityRole="header">{item.title}</Text>
              <View style={styles.tags}>
                <Tag label={item.category} />
              </View>
              <Text style={styles.summary}>{item.summary}</Text>
              <Button
                label="Learn more"
                onPress={() => setArticle(item)}
                hint={`Read ${item.title}`}
                style={styles.button}
              />
            </Card>
          </View>
        )}
      />

      <Sheet
        visible={article !== null}
        title={article?.title}
        subtitle={article?.category}
        onClose={() => setArticle(null)}
      >
        <Text style={styles.article}>{article?.body}</Text>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.page },
  list: { paddingBottom: 20 },
  filters: { paddingTop: 14, paddingBottom: 6 },
  count: { color: colors.muted, fontSize: 14, marginTop: 10, marginBottom: 8, paddingHorizontal: 16 },
  notice: { padding: 16 },
  cardWrap: { paddingHorizontal: 16, marginBottom: 14 },
  icon: { fontSize: 26, marginBottom: 4 },
  title: { color: colors.navy, fontSize: 18, fontWeight: '700' },
  tags: { flexDirection: 'row', marginTop: 8 },
  summary: { color: colors.text, fontSize: 15, lineHeight: 22, marginTop: 8 },
  button: { alignSelf: 'flex-start', marginTop: 12 },
  article: { color: colors.text, fontSize: 16, lineHeight: 25 },
});
