import PropertyCard from "@/components/PropertyCard";
import { useSupabase } from "@/hooks/useSupabase";
import { Property } from "@/types";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const C = {
  bg: "#FAF7F2",
  surface: "#FFFFFF",
  border: "#EDE8E0",
  accent: "#C4622D",
  accentDim: "#C4622D14",
  text: "#1C1917",
  textMuted: "#A89A8A",
  textSubtle: "#C9BCB0",
};

interface SavedProperty {
  id: string;
  property_id: string;
  properties: Property;
}

export default function SavedScreen() {
  const { userId } = useAuth();
  const authSupabase = useSupabase();
  const router = useRouter();
  const [saved, setSaved] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await authSupabase
      .from("saved_properties")
      .select("id, property_id, properties(*)")
      .eq("user_clerk_id", userId)
      .order("id", { ascending: false });
    setSaved((data as unknown as SavedProperty[]) ?? []);
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchSaved();
    }, [fetchSaved]),
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.accentBar} />
          <Text style={styles.title}>Saved</Text>
        </View>
        {!loading && saved.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {saved.length} {saved.length === 1 ? "property" : "properties"}
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.accent} />
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PropertyCard
              property={item.properties}
              onUnsave={() =>
                setSaved((prev) => prev.filter((s) => s.id !== item.id))
              }
              showSave
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconOuter}>
                <View style={styles.emptyIconInner}>
                  <Ionicons name="heart-outline" size={30} color={C.accent} />
                </View>
              </View>
              <Text style={styles.emptyTitle}>Nothing saved yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the heart on any property{"\n"}to save it here
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(root)/(tabs)/search")}
                style={styles.browseBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.browseBtnText}>Browse Properties</Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAF7F2" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EDE8E0",
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  accentBar: {
    width: 4,
    height: 22,
    borderRadius: 2,
    backgroundColor: "#C4622D",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1C1917",
    letterSpacing: -0.7,
  },
  countBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#C4622D14",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#C4622D28",
  },
  countText: { fontSize: 12, fontWeight: "600", color: "#C4622D" },
  listContent: { padding: 20, paddingBottom: 120, gap: 12 },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 64,
    paddingHorizontal: 40,
  },
  emptyIconOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: "#EDE8E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    backgroundColor: "#FFFFFF",
  },
  emptyIconInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#C4622D14",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1C1917",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#A89A8A",
    textAlign: "center",
    lineHeight: 20,
  },
  browseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 26,
    backgroundColor: "#C4622D",
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: "#C4622D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  browseBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
});
