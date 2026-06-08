import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const C = {
  bg: "#FAF7F2",
  surface: "#FFFFFF",
  border: "#EDE8E0",
  accent: "#C4622D",
  text: "#1C1917",
  textMuted: "#A89A8A",
  textSubtle: "#C9BCB0",
  inputBg: "#FDFBF8",
  error: "#DC2626",
};

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const inputRef = useRef<TextInput>(null);

  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const isLoading = fetchStatus === "fetching";

  const onVerifyPress = async () => {
    if (!signUp) return;
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          router.replace(decorateUrl("/") as any);
        },
      });
    }
  };

  const onSignUpPress = async () => {
    if (!signUp) return;
    const { error } = await signUp.password({
      emailAddress: email,
      password,
      firstName,
      lastName,
    });
    if (error) {
      alert(error.message);
      return;
    }
    await signUp.verifications.sendEmailCode();
  };

  if (signUp.status === "complete" && !isSignedIn) return null;

  // ── OTP verification view ──────────────────────────────────
  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <View style={styles.otpRoot}>
        <Image
          source={require("../../assets/images/kribb.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.heading}>Check your email</Text>
        <Text style={styles.subheading}>We sent a 6-digit code to {email}</Text>

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
          style={styles.otpRow}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[
                styles.otpCell,
                i === code.length && styles.otpCellActive,
              ]}
            >
              <Text style={styles.otpChar}>{code[i] || ""}</Text>
            </View>
          ))}
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          caretHidden
          style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
        />

        {errors?.fields?.code && (
          <Text style={styles.errorText}>{errors.fields.code.message}</Text>
        )}

        <TouchableOpacity
          onPress={onVerifyPress}
          disabled={isLoading}
          style={[styles.primaryBtn, isLoading && { opacity: 0.7 }]}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Verify Email</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => signUp.verifications.sendEmailCode()}
          style={styles.linkBtn}
        >
          <Text style={styles.linkText}>Resend code</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main sign-up form ───────────────────────────────────────
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.formRoot}>
          <Image
            source={require("../../assets/images/kribb.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.heading}>Create account</Text>
          <Text style={styles.subheading}>Find your dream home today</Text>

          {/* Name row */}
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>First name</Text>
              <TextInput
                style={styles.input}
                placeholder="Arjun"
                placeholderTextColor={C.textSubtle}
                autoCapitalize="words"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Last name</Text>
              <TextInput
                style={styles.input}
                placeholder="Sharma"
                placeholderTextColor={C.textSubtle}
                autoCapitalize="words"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          {/* Email */}
          <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={C.textSubtle}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors?.fields?.emailAddress && (
            <Text style={styles.errorText}>
              {errors.fields.emailAddress.message}
            </Text>
          )}

          {/* Password */}
          <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={C.textSubtle}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {errors?.fields?.password && (
            <Text style={styles.errorText}>
              {errors.fields.password.message}
            </Text>
          )}

          {/* CTA */}
          <TouchableOpacity
            onPress={onSignUpPress}
            disabled={isLoading}
            style={[
              styles.primaryBtn,
              { marginTop: 28 },
              isLoading && { opacity: 0.7 },
            ]}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/sign-in">
              <Text style={styles.linkText}>Sign In</Text>
            </Link>
          </View>

          <View nativeID="clerk-captcha" style={{ marginTop: 24 }} />
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#FAF7F2" },
  scrollContent: { flexGrow: 1 },
  formRoot: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  otpRoot: {
    flex: 1,
    backgroundColor: "#FAF7F2",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logo: { width: 100, height: 40, marginBottom: 36 },
  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1C1917",
    letterSpacing: -0.7,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: "#A89A8A",
    marginBottom: 32,
    lineHeight: 20,
  },
  nameRow: { flexDirection: "row", gap: 12 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#A89A8A",
    marginBottom: 7,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: "#FDFBF8",
    borderWidth: 1,
    borderColor: "#EDE8E0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1C1917",
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 5,
    marginBottom: 4,
    marginLeft: 2,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C4622D",
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: "#C4622D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.2,
  },
  linkBtn: { alignSelf: "center", paddingVertical: 8 },
  linkText: { fontSize: 13, fontWeight: "700", color: "#C4622D" },
  footerRow: { flexDirection: "row", justifyContent: "center" },
  footerText: { fontSize: 13, color: "#A89A8A" },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 24,
  },
  otpCell: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#EDE8E0",
    backgroundColor: "#FDFBF8",
    alignItems: "center",
    justifyContent: "center",
  },
  otpCellActive: {
    borderColor: "#C4622D",
    backgroundColor: "#C4622D08",
  },
  otpChar: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1917",
  },
});
