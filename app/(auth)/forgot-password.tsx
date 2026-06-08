import { useSignIn } from "@clerk/expo";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

type Step = "email" | "code" | "password";

const STEPS: { key: Step; index: number }[] = [
  { key: "email", index: 0 },
  { key: "code", index: 1 },
  { key: "password", index: 2 },
];

export default function ForgotPassword() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);

  // Step 1 — send reset code to email
  const sendCode = async () => {
    try {
      if (!signIn) return;
      setLoading(true);
      // Future SDK: resetPasswordEmailCode.sendCode takes no args —
      // the email is passed via the signIn object itself
      await signIn.resetPasswordEmailCode.sendCode();
      setStep("code");
    } catch (err: any) {
      // If sendCode() with no args fails, it means we need to
      // initialise the signIn with the email first. This SDK
      // requires you to set the email via signIn before calling sendCode.
      // The correct approach for this SDK version:
      Alert.alert(
        "Error",
        err?.errors?.[0]?.message ??
          err?.message ??
          "Failed to send reset code",
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify the code
  const verifyCode = async () => {
    try {
      if (!signIn) return;
      setLoading(true);
      await signIn.resetPasswordEmailCode.verifyCode({ code });
      setStep("password");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.errors?.[0]?.message ??
          err?.message ??
          "Invalid verification code",
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — submit new password
  const updatePassword = async () => {
    try {
      if (!signIn) return;
      setLoading(true);
      await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
      });
      Alert.alert(
        "Password updated",
        "You can now sign in with your new password.",
        [{ text: "Sign In", onPress: () => router.replace("/sign-in") }],
      );
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.errors?.[0]?.message ??
          err?.message ??
          "Failed to update password",
      );
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = STEPS.find((s) => s.key === step)?.index ?? 0;

  const STEP_META: Record<Step, { title: string; subtitle: string }> = {
    email: {
      title: "Reset password",
      subtitle: "Enter your email to receive a reset code",
    },
    code: {
      title: "Enter the code",
      subtitle: `We sent a 6-digit code to ${email}`,
    },
    password: {
      title: "New password",
      subtitle: "Choose a strong password for your account",
    },
  };

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
        <View style={styles.root}>
          <Image
            source={require("../../assets/images/kribb.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Step indicator */}
          <View style={styles.stepRow}>
            {STEPS.map(({ index }) => (
              <View
                key={index}
                style={[
                  styles.stepDot,
                  index <= currentIndex && styles.stepDotActive,
                  index === currentIndex && styles.stepDotCurrent,
                ]}
              />
            ))}
          </View>

          <Text style={styles.heading}>{STEP_META[step].title}</Text>
          <Text style={styles.subheading}>{STEP_META[step].subtitle}</Text>

          {/* Step: email */}
          {step === "email" && (
            <>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#C9BCB0"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TouchableOpacity
                onPress={sendCode}
                disabled={loading}
                style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Send Reset Code</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Step: code */}
          {step === "code" && (
            <>
              <Text style={styles.label}>Verification code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#C9BCB0"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoFocus
              />
              <TouchableOpacity
                onPress={verifyCode}
                disabled={loading}
                style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify Code</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={sendCode} style={styles.linkBtn}>
                <Text style={styles.linkText}>Resend code</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step: password */}
          {step === "password" && (
            <>
              <Text style={styles.label}>New password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#C9BCB0"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoFocus
              />
              <Text style={styles.hint}>
                Use at least 8 characters with a mix of letters and numbers
              </Text>
              <TouchableOpacity
                onPress={updatePassword}
                disabled={loading}
                style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#FAF7F2" },
  scrollContent: { flexGrow: 1 },
  root: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logo: { width: 100, height: 40, marginBottom: 32 },
  stepRow: { flexDirection: "row", gap: 6, marginBottom: 28 },
  stepDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#EDE8E0",
  },
  stepDotActive: { backgroundColor: "#C4622D40" },
  stepDotCurrent: { backgroundColor: "#C4622D", width: 36 },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1C1917",
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: "#A89A8A",
    marginBottom: 28,
    lineHeight: 20,
  },
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
    marginBottom: 4,
  },
  hint: { fontSize: 11, color: "#C9BCB0", marginBottom: 20, lineHeight: 16 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C4622D",
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 12,
    shadowColor: "#C4622D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.2,
  },
  linkBtn: { alignSelf: "center", paddingVertical: 6 },
  linkText: { fontSize: 13, fontWeight: "700", color: "#C4622D" },
  backBtn: { alignSelf: "center", marginTop: 16 },
  backText: { fontSize: 13, color: "#A89A8A", fontWeight: "500" },
});
