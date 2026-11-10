/* ==========================================================================
   DashboardScreen.js - profile, saved jobs, applications and recommendations

   On the website each card opens a panel lower down the page. On a phone that
   panel would be off screen, so each row opens a bottom sheet instead.
   ========================================================================== */

import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Sheet from '../components/Sheet';
import { Empty, ErrorNotice, Loading, Tag } from '../components/ui';
import { formatDate, jobsByIds, recommendedJobs } from '../lib/careerhub';
import { useApp } from '../state/AppContext';
import { colors, radius, shadow, touchTarget } from '../theme';

function Row({ icon, title, text, count, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      android_ripple={{ color: 'rgba(18, 58, 92, 0.1)' }}
      style={styles.row}
    >
      <Text style={styles.rowIcon} importantForAccessibility="no">{icon}</Text>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowBody}>
          {text}
          {count ? <Text style={styles.rowCount}> {count}</Text> : null}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
  );
}

function JobList({ jobs, emptyMessage }) {
  if (jobs.length === 0) {
    return <Empty message={emptyMessage} />;
  }
  return jobs.map((job) => (
    <View key={job.id} style={styles.listItem}>
      <Text style={styles.listTitle}>{job.title}</Text>
      <Text style={styles.listText}>{job.organisation}</Text>
      <Text style={styles.listText}>{job.location}</Text>
      <View style={styles.listMeta}>
        <Tag label={job.type} type />
        <Text style={styles.listText}>Closes {formatDate(job.closing)}</Text>
      </View>
    </View>
  ));
}

function ProfileFacts({ session, savedCount, appliedCount }) {
  const facts = [
    ['Name', session?.name || 'Not set yet'],
    ['Email', session?.email || 'Not signed in'],
    ['Course', 'Master of Information Technology'],
    ['Institute', 'Ozford Institute of Higher Education'],
    ['Saved jobs', String(savedCount)],
    ['Applications', String(appliedCount)],
  ];
  return (
    <View>
      {facts.map(([label, value]) => (
        <View key={label} style={styles.fact}>
          <Text style={styles.factLabel}>{label}</Text>
          <Text style={styles.factValue}>{value}</Text>
        </View>
      ))}
      <Text style={styles.note}>
        Education details come from the sample data. Editing the profile needs a server and a
        database, which is out of scope for this prototype.
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { jobs, saved, applied, session, reloadJobs } = useApp();
  const [panel, setPanel] = useState(null);

  const savedJobs = useMemo(() => jobsByIds(jobs.items, saved), [jobs.items, saved]);
  const appliedJobs = useMemo(() => jobsByIds(jobs.items, applied), [jobs.items, applied]);
  const suggestions = useMemo(
    () => recommendedJobs(jobs.items, saved, applied),
    [jobs.items, saved, applied]
  );

  const panelTitles = {
    profile: 'My Profile',
    saved: 'Saved Jobs',
    applied: 'Applications',
    recommended: 'Recommended Jobs',
  };

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting} accessibilityRole="header">
          {session?.name ? `Welcome back, ${session.name}` : 'Welcome, Student!'}
        </Text>
        <Text style={styles.lead}>Manage your career activities from your dashboard.</Text>

        {jobs.status === 'loading' && <Loading message="Loading your dashboard" />}
        {jobs.status === 'error' && <ErrorNotice message={jobs.error} onRetry={reloadJobs} />}
        {jobs.status === 'ready' && (
          <View style={styles.rows}>
            <Row
              icon={'\u{1F464}'}
              title="My Profile"
              text="View your student details and a summary of your activity."
              onPress={() => setPanel('profile')}
            />
            <Row
              icon={'❤️'}
              title="Saved Jobs"
              text="View jobs you have saved for later."
              count={`${savedJobs.length} saved.`}
              onPress={() => setPanel('saved')}
            />
            <Row
              icon={'\u{1F4CB}'}
              title="Applications"
              text="Track the jobs you have applied for."
              count={`${appliedJobs.length} applied.`}
              onPress={() => setPanel('applied')}
            />
            <Row
              icon={'\u{1F3AF}'}
              title="Recommended Jobs"
              text="Discover opportunities suggested from the roles you have shown interest in."
              count={`${suggestions.length} suggested.`}
              onPress={() => setPanel('recommended')}
            />
          </View>
        )}
      </ScrollView>

      <Sheet visible={panel !== null} title={panelTitles[panel]} onClose={() => setPanel(null)}>
        {panel === 'profile' && (
          <ProfileFacts
            session={session}
            savedCount={savedJobs.length}
            appliedCount={appliedJobs.length}
          />
        )}
        {panel === 'saved' && (
          <JobList
            jobs={savedJobs}
            emptyMessage="Nothing saved yet. Open the Jobs tab and save an opportunity to see it here."
          />
        )}
        {panel === 'applied' && (
          <JobList
            jobs={appliedJobs}
            emptyMessage="No applications yet. Apply for an opportunity from the Jobs tab."
          />
        )}
        {panel === 'recommended' && (
          <View>
            <JobList jobs={suggestions} emptyMessage="No further suggestions right now." />
            <Text style={styles.note}>
              Suggestions are based on the categories of the jobs you have already saved.
            </Text>
          </View>
        )}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.page },
  content: { padding: 16, paddingBottom: 24 },
  greeting: { color: colors.navy, fontSize: 26, fontWeight: '700', marginTop: 4 },
  lead: { color: colors.text, fontSize: 15, lineHeight: 22, marginTop: 4, marginBottom: 16 },
  rows: { gap: 12 },
  row: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    boxShadow: shadow,
  },
  rowIcon: { fontSize: 26 },
  rowText: { flex: 1 },
  rowTitle: { color: colors.navy, fontSize: 17, fontWeight: '700' },
  rowBody: { color: colors.text, fontSize: 14, lineHeight: 20, marginTop: 2 },
  rowCount: { fontWeight: '700', color: colors.navy },
  listItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  listTitle: { color: colors.navy, fontSize: 16, fontWeight: '700' },
  listText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  listMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 6 },
  fact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  factLabel: { color: colors.muted, fontSize: 14 },
  factValue: { color: colors.navy, fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  note: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 12 },
});
