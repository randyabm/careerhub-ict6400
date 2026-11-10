/* ==========================================================================
   JobsScreen.js - search, filter, save, apply and read job details

   Everything is filtered from the list already in memory, so results update
   on every key press, the same as the web page.
   ========================================================================== */

import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
import JobCard from '../components/JobCard';
import Sheet from '../components/Sheet';
import { ChipRow, Empty, ErrorNotice, Loading, PageTitle, Tag } from '../components/ui';
import { categories, filterJobs, formatDate, jobTypes } from '../lib/careerhub';
import { useApp } from '../state/AppContext';
import { colors, radius, touchTarget } from '../theme';

export default function JobsScreen() {
  const { jobs, saved, applied, toggleSaved, markApplied, reloadJobs } = useApp();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('Any');
  const [category, setCategory] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);

  const visible = useMemo(
    () => filterJobs(jobs.items, { query, type, category }),
    [jobs.items, query, type, category]
  );
  const typeOptions = useMemo(() => jobTypes(jobs.items), [jobs.items]);
  const categoryOptions = useMemo(() => categories(jobs.items), [jobs.items]);

  const renderJob = useCallback(
    ({ item }) => (
      <View style={styles.cardWrap}>
        <JobCard
          job={item}
          saved={saved.includes(item.id)}
          applied={applied.includes(item.id)}
          onToggleSave={toggleSaved}
          onApply={markApplied}
          onDetails={setSelectedJob}
        />
      </View>
    ),
    [saved, applied, toggleSaved, markApplied]
  );

  /* This is an element, not a component defined here. A new component on each
     render would rebuild the text box and close the keyboard after one letter. */
  const header = (
    <View>
      <PageTitle
        title="Jobs"
        subtitle="Search part-time, casual, internship and entry level opportunities."
      />
      {jobs.status === 'ready' && (
        <View style={styles.filters}>
          <View style={styles.searchWrap}>
            <Text style={styles.label} nativeID="keyword-label">Keyword</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={Keyboard.dismiss}
              placeholder="Job title, organisation or suburb"
              placeholderTextColor={colors.muted}
              returnKeyType="search"
              autoCorrect={false}
              accessibilityLabelledBy="keyword-label"
              style={styles.input}
            />
          </View>
          <Text style={styles.filterLabel}>Job type</Text>
          <ChipRow options={typeOptions} selected={type} onSelect={setType} label="Job type" />
          <Text style={styles.filterLabel}>Category</Text>
          <ChipRow
            options={categoryOptions}
            selected={category}
            onSelect={setCategory}
            label="Category"
          />
          <Text style={styles.count} accessibilityLiveRegion="polite">
            {visible.length} of {jobs.items.length} opportunities shown. Saved jobs: {saved.length}.
            {' '}Applications: {applied.length}.
          </Text>
        </View>
      )}
    </View>
  );

  let empty = (
    <View style={styles.cardWrap}>
      <Empty message="No opportunities match that search. Try a different keyword, or set the job type back to Any." />
    </View>
  );
  if (jobs.status === 'loading') {
    empty = <Loading message="Loading opportunities" />;
  } else if (jobs.status === 'error') {
    empty = (
      <View style={styles.notice}>
        <ErrorNotice message={jobs.error} onRetry={reloadJobs} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <FlatList
        data={visible}
        keyExtractor={(job) => job.id}
        renderItem={renderJob}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.list}
      />

      <Sheet
        visible={selectedJob !== null}
        title={selectedJob?.title}
        subtitle={selectedJob ? `${selectedJob.organisation} · ${selectedJob.location}` : ''}
        onClose={() => setSelectedJob(null)}
      >
        {selectedJob && (
          <View>
            <View style={styles.tags}>
              <Tag label={selectedJob.type} type />
              <Tag label={selectedJob.hours} />
              <Tag label={selectedJob.rate} />
            </View>
            <Text style={styles.body}>{selectedJob.summary}</Text>
            {selectedJob.requirements.length > 0 && (
              <View>
                <Text style={styles.heading} accessibilityRole="header">
                  What they are looking for
                </Text>
                {selectedJob.requirements.map((requirement) => (
                  <Text key={requirement} style={styles.bullet}>{`•  ${requirement}`}</Text>
                ))}
              </View>
            )}
            <Text style={styles.body}>
              <Text style={styles.bold}>Applications close: </Text>
              {formatDate(selectedJob.closing)}
            </Text>
          </View>
        )}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.page },
  list: { paddingBottom: 20 },
  cardWrap: { paddingHorizontal: 16, marginBottom: 14 },
  notice: { padding: 16 },
  filters: { paddingTop: 16, paddingBottom: 6 },
  searchWrap: { paddingHorizontal: 16 },
  label: { color: colors.navy, fontSize: 14, fontWeight: '600', marginBottom: 6 },
  filterLabel: {
    color: colors.navy,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 2,
    paddingHorizontal: 16,
  },
  input: {
    minHeight: touchTarget,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
  },
  count: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 12, marginBottom: 8, paddingHorizontal: 16 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  body: { color: colors.text, fontSize: 15, lineHeight: 23, marginTop: 12 },
  bold: { fontWeight: '700', color: colors.navy },
  heading: { color: colors.navy, fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 4 },
  bullet: { color: colors.text, fontSize: 15, lineHeight: 23, marginTop: 2 },
});
