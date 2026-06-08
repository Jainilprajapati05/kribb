import FeaturedCard from "@/components/FeaturedCard";
import PropertyCard from "@/components/PropertyCard";
import { supabase } from "@/lib/supabase";
import { Property } from "@/types";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
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
  accentSoft: "#E8845A",
  text: "#1C1917",
  textMid: "#6B5E52",
  textMuted: "#A89A8A",
  textSubtle: "#C9BCB0",
};

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [featured, setFeatured] = useState<Property[]>([]);
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, []),
  );

  const fetchProperties = async () => {
    setLoading(true);
    const { data: featuredData } = await supabase
      .from("properties")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false });
    const { data: recommendedData } = await supabase
      .from("properties")
      .select("*")
      .eq("is_featured", false)
      .order("created_at", { ascending: false });
    setFeatured(featuredData ?? []);
    setRecommended(recommendedData ?? []);
    setLoading(false);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={recommended}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                <Text style={styles.userName}>
                  {user?.firstName ?? "Welcome"}
                </Text>
              </View>
              <View style={styles.logoWrapper}>
                <Image
                  source={require("../../../assets/images/kribb.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Search Bar */}
            <TouchableOpacity
              onPress={() => router.push("/(root)/(tabs)/search")}
              style={styles.searchBar}
              activeOpacity={0.85}
            >
              <View style={styles.searchIconWrap}>
                <Ionicons name="search-outline" size={16} color={C.accent} />
              </View>
              <Text style={styles.searchPlaceholder}>
                Search properties, cities...
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push("/(root)/(tabs)/search?openFilters=true")
                }
                style={styles.filterBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="options-outline" size={15} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Featured Label */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccentBar} />
              <Text style={styles.sectionLabel}>Featured</Text>
            </View>

            {/* Featured Carousel */}
            {loading ? (
              <ActivityIndicator
                size="small"
                color={C.accent}
                style={{ paddingVertical: 40 }}
              />
            ) : (
              <FlatList
                data={featured}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <FeaturedCard property={item} />}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              />
            )}

            {/* Recommended Label */}
            <View style={[styles.sectionHeader, { marginTop: 28 }]}>
              <View style={styles.sectionAccentBar} />
              <Text style={styles.sectionLabel}>Recommended</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <PropertyCard property={item} />
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="home-outline" size={40} color={C.textSubtle} />
              <Text style={styles.emptyText}>No properties found</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAF7F2" },
  listContent: { paddingBottom: 120 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 12,
    fontWeight: "500",
    color: C.textMuted,
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  userName: {
    fontSize: 26,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.6,
  },
  logoWrapper: {
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  logo: { width: 68, height: 26 },
  searchBar: {
    marginHorizontal: 20,
    marginBottom: 28,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: C.accentDim,
    alignItems: "center",
    justifyContent: "center",
  },
  searchPlaceholder: { flex: 1, fontSize: 14, color: C.textMuted },
  filterBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    marginBottom: 16,
    gap: 10,
  },
  sectionAccentBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: C.accent,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.3,
  },
  cardWrapper: { paddingHorizontal: 20, marginBottom: 2 },
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyText: { color: C.textMuted, fontSize: 14 },
});
