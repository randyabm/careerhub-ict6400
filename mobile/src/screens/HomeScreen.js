/* ==========================================================================
   HomeScreen.js - introduces the platform and leads to the other tabs
   ========================================================================== */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card } from '../components/ui';
import { colors } from '../theme';

const FEATURES = [
  {
    icon: '\u{1F4BC}',
    title: 'Find Jobs',
    text: 'Search part-time, casual and graduate employment opportunities in one place, filtered by the kind of work you are after.',
    action: 'Browse jobs',
    tab: 'Jobs',
  },
  {
    icon: '\u{1F4C4}',
    title: 'Career Resources',
    text: 'Access resume tips, cover letter guidance and interview preparation, written for students with little work history.',
    action: 'Read the guides',
    tab: 'Resources',
  },
  {
    icon: '\u{1F3AF}',
    title: 'Career Support',
    text: 'Keep track of what you have saved and applied for, and see suggestions based on the roles you are interested in.',
    action: 'Open dashboard',
    tab: 'Dashboard',
  },
];

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      {/* The same 165 degree, three colour gradient as the .hero class on the web. */}
      <LinearGradient
        colors={[colors.blue, colors.blueLight, colors.navy]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.37, y: 0 }}
        end={{ x: 0.63, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroTitle} accessibilityRole="header">
          Find Your Perfect Career Opportunity
        </Text>
        <Text style={styles.heroText}>
          Discover jobs, internships and career resources designed to support students.
        </Text>
        <Button
          label="Explore Jobs"
          variant="primary"
          onPress={() => navigation.navigate('Jobs')}
          style={styles.heroButton}
        />
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          How CareerHub Helps Students
        </Text>
        {FEATURES.map((feature) => (
          <Card key={feature.title} style={styles.card}>
            <Text style={styles.icon} importantForAccessibility="no">{feature.icon}</Text>
            <Text style={styles.cardTitle} accessibilityRole="header">{feature.title}</Text>
            <Text style={styles.cardText}>{feature.text}</Text>
            <Button
              label={feature.action}
              onPress={() => navigation.navigate(feature.tab)}
              style={styles.cardButton}
            />
          </Card>
        ))}
      </View>

      <Text style={styles.footer}>
        {'©'} 2026 Student Career Hub | ICT6400 Assessment Project
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.page },
  content: { paddingBottom: 20 },
  hero: { paddingHorizontal: 24, paddingVertical: 44, alignItems: 'center' },
  heroTitle: { color: '#ffffff', fontSize: 30, lineHeight: 37, fontWeight: '700', textAlign: 'center' },
  heroText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 10,
  },
  heroButton: { marginTop: 20 },
  section: { padding: 16, gap: 14 },
  sectionTitle: { color: colors.navy, fontSize: 21, fontWeight: '700', textAlign: 'center', marginVertical: 6 },
  card: { gap: 4 },
  icon: { fontSize: 26, marginBottom: 4 },
  cardTitle: { color: colors.navy, fontSize: 18, fontWeight: '700' },
  cardText: { color: colors.text, fontSize: 15, lineHeight: 22 },
  cardButton: { alignSelf: 'flex-start', marginTop: 10 },
  footer: { color: colors.muted, fontSize: 12, textAlign: 'center', paddingHorizontal: 16 },
});
