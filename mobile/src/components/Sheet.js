/* ==========================================================================
   Sheet.js - a bottom sheet
   The website reuses one <dialog> for job details and resource articles. This
   is the phone version: it rises from the bottom, where the thumb already is.
   The Android back button and a tap on the dimmed area both close it.
   ========================================================================== */

import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from './ui';
import { colors, radius } from '../theme';

export default function Sheet({ visible, title, subtitle, onClose, children }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <Text style={styles.title} accessibilityRole="header">{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {children}
          </ScrollView>
          <Button label="Close" onPress={onClose} variant="ghost" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(13, 44, 71, 0.55)' },
  sheet: {
    maxHeight: '86%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius * 2,
    borderTopRightRadius: radius * 2,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  title: { color: colors.navy, fontSize: 21, fontWeight: '700' },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 2 },
  body: { marginTop: 12, marginBottom: 12, flexGrow: 0 },
  bodyContent: { paddingBottom: 4 },
});
