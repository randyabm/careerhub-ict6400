/* ==========================================================================
   LoginScreen.js - login form with validation

   As on the website this only checks the format of what was typed. There is
   no server, so it is not real authentication, and the screen says so. The
   password stays in this screen's memory and is never saved or sent by the
   app. Autofill is turned off for both fields, but on recent Android versions
   the phone's own password manager can still offer to save a password field.
   ========================================================================== */

import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button, Card } from '../components/ui';
import { displayNameFrom, validateLogin } from '../lib/careerhub';
import { useApp } from '../state/AppContext';
import { colors, radius, touchTarget } from '../theme';

export default function LoginScreen({ navigation }) {
  const { session, setSession } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [accountNote, setAccountNote] = useState('');
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  function submit() {
    const found = validateLogin(email, password);
    setErrors(found);

    /* Move the cursor to the first field with a problem. */
    if (found.email) {
      emailRef.current?.focus();
      return;
    }
    if (found.password) {
      passwordRef.current?.focus();
      return;
    }

    const cleanEmail = email.trim();
    setSession({ email: cleanEmail, name: displayNameFrom(cleanEmail) });
    setEmail('');
    setPassword('');
    navigation.navigate('Dashboard');
  }

  if (session) {
    return (
      <View style={styles.page}>
        <View style={styles.content}>
          <Card>
            <Text style={styles.title} accessibilityRole="header">Signed in</Text>
            <Text style={styles.lead}>{session.email}</Text>
            <Button label="Sign out" onPress={() => setSession(null)} style={styles.submit} />
          </Card>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.page} behavior="padding">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={styles.title} accessibilityRole="header">Student Login</Text>
          <Text style={styles.lead}>Sign in to reach your dashboard, saved jobs and applications.</Text>

          <Text style={styles.label} nativeID="email-label">Email Address</Text>
          <TextInput
            ref={emailRef}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setErrors((current) => ({ ...current, email: '' }));
            }}
            onSubmitEditing={() => passwordRef.current?.focus()}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            importantForAutofill="noExcludeDescendants"
            returnKeyType="next"
            submitBehavior="submit"
            accessibilityLabelledBy="email-label"
            style={[styles.input, errors.email && styles.inputError]}
          />
          <Text style={styles.error} accessibilityLiveRegion="polite">{errors.email}</Text>

          <Text style={styles.label} nativeID="password-label">Password</Text>
          <TextInput
            ref={passwordRef}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setErrors((current) => ({ ...current, password: '' }));
            }}
            onSubmitEditing={submit}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="off"
            importantForAutofill="noExcludeDescendants"
            returnKeyType="done"
            accessibilityLabelledBy="password-label"
            style={[styles.input, errors.password && styles.inputError]}
          />
          <Text style={styles.error} accessibilityLiveRegion="polite">{errors.password}</Text>

          <Button label="Login" variant="solid" onPress={submit} style={styles.submit} />

          <View style={styles.alt}>
            <Text style={styles.altText}>New to CareerHub? </Text>
            <Pressable
              accessibilityRole="link"
              hitSlop={12}
              onPress={() =>
                setAccountNote(
                  'Account creation is not part of this prototype. Sign in with any student email to reach the dashboard.'
                )
              }
            >
              <Text style={styles.link}>Create an account</Text>
            </Pressable>
          </View>
          {accountNote ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">{accountNote}</Text>
          ) : null}

          <Text style={styles.note}>
            This prototype only checks the format of your details. CareerHub does not save or send your password.
          </Text>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.page },
  content: { padding: 16 },
  title: { color: colors.navy, fontSize: 24, fontWeight: '700' },
  lead: { color: colors.text, fontSize: 15, lineHeight: 22, marginTop: 4, marginBottom: 16 },
  label: { color: colors.navy, fontSize: 14, fontWeight: '600', marginBottom: 6 },
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
  inputError: { borderColor: colors.accent },
  error: { color: colors.accent, fontSize: 13, lineHeight: 18, marginTop: 4, marginBottom: 8, minHeight: 18 },
  submit: { marginTop: 8 },
  alt: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 },
  altText: { color: colors.text, fontSize: 14 },
  link: { color: colors.blue, fontSize: 14, textDecorationLine: 'underline' },
  note: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 12 },
});
