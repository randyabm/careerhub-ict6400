/* ==========================================================================
   ui.js - small building blocks used by every screen
   These are the mobile versions of the .btn, .chip, .tag, .card, .notice and
   .empty classes in the web stylesheet.
   ========================================================================== */

import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, touchTarget } from '../theme';

export function Button({ label, onPress, variant = 'outline', disabled = false, style, hint }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      android_ripple={{ color: 'rgba(18, 58, 92, 0.15)' }}
      style={[styles.button, styles[`button_${variant}`], disabled && styles.buttonDisabled, style]}
    >
      <Text style={[styles.buttonText, styles[`buttonText_${variant}`]]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Tag({ label, type = false }) {
  if (!label) {
    return null;
  }
  return (
    <View style={[styles.tag, type && styles.tagType]}>
      <Text style={[styles.tagText, type && styles.tagTextType]}>{label}</Text>
    </View>
  );
}

/* One horizontal row of filter chips. On the web the chips wrap onto several
   lines, but on a phone that would push the results off the screen. */
export function ChipRow({ options, selected, onSelect, label }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      accessibilityLabel={label}
      contentContainerStyle={styles.chipRow}
    >
      {options.map((option) => {
        const active = option === selected;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function Empty({ message }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

export function ErrorNotice({ message, onRetry }) {
  return (
    <View style={styles.error} accessibilityRole="alert">
      <Text style={styles.errorTitle}>That data could not be loaded.</Text>
      <Text style={styles.errorText}>{message} Check your internet connection and try again.</Text>
      <Button label="Try again" onPress={onRetry} variant="solid" style={styles.retry} />
    </View>
  );
}

export function Loading({ message }) {
  return (
    <View style={styles.loading} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.navy} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

/* The navy band with the page title, like the page headers on the website. */
export function PageTitle({ title, subtitle }) {
  return (
    <View style={styles.pageTitle}>
      <Text style={styles.pageTitleText} accessibilityRole="header">{title}</Text>
      <Text style={styles.pageSubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget,
    minWidth: 88,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  button_outline: { backgroundColor: colors.surface, borderColor: colors.navy },
  button_solid: { backgroundColor: colors.navy, borderColor: colors.navy },
  button_ghost: { backgroundColor: 'transparent', borderColor: colors.border },
  button_primary: { backgroundColor: colors.surface, borderColor: colors.surface },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { fontSize: 15, fontWeight: '600', color: colors.navy },
  buttonText_outline: {},
  buttonText_solid: { color: '#ffffff' },
  buttonText_ghost: { fontWeight: '500' },
  buttonText_primary: {},

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    boxShadow: shadow,
  },

  tag: {
    backgroundColor: colors.tagBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagType: { backgroundColor: colors.typeTagBg },
  tagText: { fontSize: 12, fontWeight: '600', color: colors.navy },
  tagTextType: { color: colors.typeTagText },

  chipRow: { gap: 8, paddingHorizontal: 16, paddingVertical: 4 },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { fontSize: 14, fontWeight: '500', color: colors.text },
  chipTextActive: { color: '#ffffff' },

  empty: {
    padding: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius,
  },
  emptyText: { textAlign: 'center', color: colors.muted, fontSize: 15, lineHeight: 22 },

  error: {
    padding: 16,
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius,
  },
  errorTitle: { color: colors.errorText, fontWeight: '700', fontSize: 15, marginBottom: 4 },
  errorText: { color: colors.errorText, fontSize: 15, lineHeight: 22 },
  retry: { marginTop: 12, alignSelf: 'flex-start' },

  loading: { padding: 40, alignItems: 'center', gap: 12 },
  loadingText: { color: colors.muted, fontSize: 15 },

  pageTitle: {
    backgroundColor: colors.navy,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
  },
  pageTitleText: { color: '#ffffff', fontSize: 28, fontWeight: '700', textAlign: 'center' },
  pageSubtitle: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 4,
  },
});
