import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const C = {
  bg: "#FAF7F2",
  surface: "#FFFFFF",
  border: "#EDE8E0",
  accent: "#C4622D",
  accentDim: "#C4622D14",
  text: "#1C1917",
  textMuted: "#A89A8A",
};

export default function MapScreen() {
  const { latitude, longitude, title, address } = useLocalSearchParams<{
    latitude: string;
    longitude: string;
    title: string;
    address: string;
  }>();
  const router = useRouter();

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    lng - 0.001
  }%2C${lat - 0.001}%2C${lng + 0.001}%2C${
    lat + 0.001
  }&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={19} color={C.text} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.headerAddress} numberOfLines={1}>
            {address}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`)
          }
          style={styles.mapsBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate-outline" size={13} color={C.accent} />
          <Text style={styles.mapsBtnText}>Maps</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <WebView source={{ uri: mapUrl }} style={{ flex: 1 }} />

      {/* Attribution bar */}
      <View style={styles.attributionBar}>
        <Ionicons name="location-outline" size={12} color={C.textMuted} />
        <Text style={styles.attributionText}>
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAF7F2" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EDE8E0",
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#FAF7F2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EDE8E0",
  },
  headerInfo: { flex: 1 },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1C1917",
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  headerAddress: { fontSize: 11, color: "#A89A8A" },
  mapsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#C4622D14",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C4622D30",
  },
  mapsBtnText: { fontSize: 12, fontWeight: "700", color: "#C4622D" },
  attributionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EDE8E0",
  },
  attributionText: { fontSize: 11, color: "#A89A8A", fontWeight: "500" },
});
