/* ==========================================================================
   JobCard.js - one vacancy in the Jobs list
   The same content and three actions as the card on the website.
   ========================================================================== */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Tag } from './ui';
import { formatDate } from '../lib/careerhub';
import { colors } from '../theme';

function JobCard({ job, saved, applied, onToggleSave, onApply, onDetails }) {
  return (
    <Card style={saved && styles.savedCard}>
      <Text style={styles.title} accessibilityRole="header">{job.title}</Text>
      <Text style={styles.organisation}>{job.organisation}</Text>

      <View style={styles.tags}>
        <Tag label={job.type} type />
        <Tag label={job.location} />
      </View>

      <Text style={styles.summary}>{job.summary}</Text>

      <View style={styles.tags}>
        <Tag label={job.hours} />
        <Tag label={`Close ${formatDate(job.closing)}`} />
      </View>

      <View style={styles.actions}>
        <Button
          label={saved ? 'Saved' : 'Save'}
          onPress={() => onToggleSave(job.id)}
          hint={`Save ${job.title}`}
          style={styles.action}
        />
        <Button
          label={applied ? 'Applied' : 'Apply'}
          onPress={() => onApply(job.id)}
          disabled={applied}
          variant="solid"
          hint={`Apply for ${job.title}`}
          style={styles.action}
        />
        <Button
          label="Details"
          onPress={() => onDetails(job)}
          variant="ghost"
          hint={`Details of ${job.title}`}
          style={styles.action}
        />
      </View>
    </Card>
  );
}

/* Typing in the search box re-renders the list, so unchanged cards are skipped. */
export default React.memo(JobCard);

const styles = StyleSheet.create({
  savedCard: { borderColor: colors.accent },
  title: { color: colors.navy, fontSize: 18, fontWeight: '700' },
  organisation: { color: colors.muted, fontSize: 15, fontWeight: '600', marginTop: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  summary: { color: colors.text, fontSize: 15, lineHeight: 22, marginTop: 10 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  action: { flexGrow: 1, flexBasis: 88 },
});
