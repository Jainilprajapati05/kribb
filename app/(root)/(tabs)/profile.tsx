import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const C = {
  bg: "#FAF7F2",
  surface: "#FFFFFF",
  surfaceWarm: "#F5F0E8",
  border: "#EDE8E0",
  accent: "#C4622D",
  accentDim: "#C4622D14",
  text: "#1C1917",
  textMid: "#6B5E52",
  textMuted: "#A89A8A",
  textSubtle: "#C9BCB0",
  danger: "#DC2626",
  dangerDim: "#DC262610",
};

export default function ProfileScreen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUpdateProfileImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (result.canceled) return;
      setIsUpdating(true);
      const base64Image = result.assets[0].base64;
      const uri = result.assets[0].uri;
      const filename = uri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${base64Image}`;
      await user?.setProfileImage({ file: dataUrl });
      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error) {
      console.error("Error updating profile image:", error);
      Alert.alert(
        "Error",
        "Failed to update profile picture. Please try again.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Warm hero band */}
      <View style={styles.heroBand}>
        <View style={styles.avatarRing}>
          <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
          <TouchableOpacity
            onPress={handleUpdateProfileImage}
            disabled={isUpdating}
            style={styles.cameraBtn}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="camera" size={13} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.displayName}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.emailText}>
          {user.emailAddresses[0].emailAddress}
        </Text>
      </View>

      {/* Menu */}
      <View style={styles.menuContainer}>
        <MenuItem
          icon="heart-outline"
          label="Saved Properties"
          onPress={() => router.push("/(root)/(tabs)/saved")}
        />
        <MenuItem
          icon="notifications-outline"
          label="Notifications"
          onPress={() =>
            Alert.alert("Coming Soon", "Notifications coming soon!")
          }
        />
        <MenuItem
          icon="settings-outline"
          label="Settings"
          onPress={() => Alert.alert("Coming Soon", "Settings coming soon!")}
        />
        <MenuItem
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() =>
            Linking.openURL(
              "mailto:jainilprajapati491@gmail.com?subject=Help%20%26%20Support%20-%20Kribb%20App",
            )
          }
        />
      </View>

      {/* Sign Out */}
      <View style={styles.signOutWrapper}>
        <TouchableOpacity
          onPress={handleSignOut}
          style={styles.signOutBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color={C.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.menuItem}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconWrapper}>
        <Ionicons name={icon} size={18} color={C.accent} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={14} color={C.textSubtle} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAF7F2" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroBand: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingTop: 32,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#EDE8E0",
    marginBottom: 20,
  },
  avatarRing: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 3,
    borderColor: "#C4622D",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    position: "relative",
  },
  avatar: { width: 84, height: 84, borderRadius: 42 },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#C4622D",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#FAF7F2",
  },
  displayName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1C1917",
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  emailText: { fontSize: 13, color: "#A89A8A", letterSpacing: 0.1 },
  menuContainer: { paddingHorizontal: 20, gap: 8 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EDE8E0",
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#C4622D14",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 14, color: "#1C1917", fontWeight: "500" },
  signOutWrapper: {
    marginTop: "auto",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#DC262610",
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DC262622",
  },
  signOutText: { fontSize: 14, fontWeight: "600", color: "#DC2626" },
});
