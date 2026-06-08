import { useSavedProperty } from "@/hooks/useSavedProperty";
import { useSupabase } from "@/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { Property } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageViewing from "react-native-image-viewing";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const { width } = Dimensions.get("window");
const ADMIN_PHONE = "919999999999";

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
};

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isAdmin = useUserStore((state) => state.isAdmin);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const { isSaved, saveLoading, toggleSave } = useSavedProperty(id ?? "");
  const authSupabase = useSupabase();

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();
    setProperty(data);
    setLoading(false);
  };

  const handleDelete = () => {
    Alert.alert("Delete Property", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await authSupabase.from("properties").delete().eq("id", id);
          router.replace("/(root)/(tabs)");
        },
      },
    ]);
  };

  const handleMarkSold = () => {
    Alert.alert("Mark as Sold", "This will mark the property as sold.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark Sold",
        onPress: async () => {
          await authSupabase
            .from("properties")
            .update({ is_sold: true })
            .eq("id", id);
          setProperty((prev) => (prev ? { ...prev, is_sold: true } : prev));
        },
      },
    ]);
  };

  const handleContact = () => {
    const message = `Hi! I'm interested in the property: ${property?.title}`;
    Linking.openURL(
      `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`,
    );
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.centerScreen}>
        <Ionicons name="home-outline" size={48} color={C.textSubtle} />
        <Text style={styles.notFoundText}>Property not found</Text>
      </View>
    );
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    property.longitude - 0.003
  }%2C${property.latitude - 0.003}%2C${property.longitude + 0.003}%2C${
    property.latitude + 0.003
  }&layer=mapnik&marker=${property.latitude}%2C${property.longitude}`;

  const isLongDesc = (property.description?.length ?? 0) > 150;
  const displayDesc =
    expanded || !isLongDesc
      ? property.description
      : property.description?.slice(0, 150) + "...";

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Image Carousel ── */}
        <View style={{ opacity: property.is_sold ? 0.55 : 1 }}>
          <FlatList
            data={property.images}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setImageViewerVisible(true)}
                activeOpacity={0.95}
              >
                <Image
                  source={{ uri: item }}
                  style={{ width, height: 320 }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
          />

          {/* Image counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {activeIndex + 1} / {property.images.length}
            </Text>
          </View>

          {/* Dot indicators */}
          {property.images.length > 1 && (
            <View style={styles.dotsRow}>
              {property.images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Back + Save overlay */}
        <SafeAreaView style={styles.overlayButtons}>
          <View style={styles.overlayRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.overlayBtn}
            >
              <Ionicons name="arrow-back" size={20} color={C.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleSave}
              disabled={saveLoading}
              style={styles.overlayBtn}
            >
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={20}
                color={isSaved ? C.accent : C.text}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* ── Content ── */}
        <View style={[styles.content, property.is_sold && { opacity: 0.65 }]}>
          {/* Badges */}
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{property.type}</Text>
            </View>
            {property.is_featured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>⭐ Featured</Text>
              </View>
            )}
            {property.is_sold && (
              <View style={styles.soldBadge}>
                <Text style={styles.soldBadgeText}>Sold</Text>
              </View>
            )}
          </View>

          {/* Title + Price */}
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.price}>{formatPrice(property.price)}</Text>

          {/* Specs */}
          <View style={styles.specsCard}>
            <SpecItem
              icon="bed-outline"
              label="Beds"
              value={`${property.bedrooms}`}
            />
            <View style={styles.specDivider} />
            <SpecItem
              icon="water-outline"
              label="Baths"
              value={`${property.bathrooms}`}
            />
            <View style={styles.specDivider} />
            <SpecItem
              icon="expand-outline"
              label="Area"
              value={`${property.area_sqft} ft²`}
            />
            <View style={styles.specDivider} />
            <SpecItem icon="home-outline" label="Type" value={property.type} />
          </View>

          {/* Description */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.descText}>{displayDesc}</Text>
            {isLongDesc && (
              <TouchableOpacity
                onPress={() => setExpanded(!expanded)}
                style={{ marginTop: 6 }}
              >
                <Text style={styles.readMoreText}>
                  {expanded ? "Show less" : "Read more"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Location */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={15} color={C.textMuted} />
              <Text style={styles.locationText}>
                {property.address}, {property.city}
              </Text>
            </View>

            {/* Map */}
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(root)/property/map",
                  params: {
                    latitude: property.latitude,
                    longitude: property.longitude,
                    title: property.title,
                    address: `${property.address}, ${property.city}`,
                  },
                })
              }
              activeOpacity={0.9}
              style={styles.mapWrapper}
            >
              <WebView
                source={{ uri: mapUrl }}
                style={{ flex: 1 }}
                scrollEnabled={false}
                pointerEvents="none"
              />
              <View style={styles.mapExpandHint}>
                <Ionicons name="expand-outline" size={11} color={C.textMid} />
                <Text style={styles.mapExpandText}>Tap to expand</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Contact */}
          <TouchableOpacity
            onPress={handleContact}
            style={styles.contactBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={styles.contactBtnText}>Contact Agent on WhatsApp</Text>
          </TouchableOpacity>

          {/* Admin Actions */}
          {isAdmin && (
            <View style={styles.adminRow}>
              {!property.is_sold && (
                <TouchableOpacity
                  onPress={handleMarkSold}
                  style={styles.markSoldBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={17}
                    color="#B45309"
                  />
                  <Text style={styles.markSoldText}>Mark Sold</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.deleteBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={17} color="#DC2626" />
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <ImageViewing
        images={property.images.map((uri) => ({ uri }))}
        imageIndex={activeIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
    </View>
  );
}

function SpecItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.specItem}>
      <View style={styles.specIconWrap}>
        <Ionicons name={icon} size={18} color={C.accent} />
      </View>
      <Text style={styles.specValue}>{value}</Text>
      <Text style={styles.specLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FAF7F2" },
  centerScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAF7F2",
    gap: 12,
  },
  notFoundText: { fontSize: 15, color: "#A89A8A" },
  // Carousel overlays
  imageCounter: {
    position: "absolute",
    bottom: 14,
    right: 16,
    backgroundColor: "rgba(28,25,23,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  imageCounterText: { fontSize: 11, fontWeight: "600", color: "#fff" },
  dotsRow: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  dotActive: { width: 18, backgroundColor: "#fff" },
  overlayButtons: { position: "absolute", top: 0, left: 0, right: 0 },
  overlayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  overlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(250,247,242,0.92)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(237,232,224,0.6)",
  },
  // Content
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 48 },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  typeBadge: {
    backgroundColor: "#C4622D14",
    borderWidth: 1,
    borderColor: "#C4622D30",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#C4622D",
    textTransform: "capitalize",
  },
  featuredBadge: {
    backgroundColor: "#FEF3C714",
    borderWidth: 1,
    borderColor: "#F59E0B30",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  featuredBadgeText: { fontSize: 11, fontWeight: "700", color: "#B45309" },
  soldBadge: {
    backgroundColor: "#DC262614",
    borderWidth: 1,
    borderColor: "#DC262628",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  soldBadgeText: { fontSize: 11, fontWeight: "700", color: "#DC2626" },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1C1917",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  price: {
    fontSize: 22,
    fontWeight: "800",
    color: "#C4622D",
    letterSpacing: -0.4,
    marginBottom: 22,
  },
  // Specs
  specsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EDE8E0",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  specItem: { alignItems: "center", gap: 5, flex: 1 },
  specIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#C4622D14",
    alignItems: "center",
    justifyContent: "center",
  },
  specValue: { fontSize: 14, fontWeight: "800", color: "#1C1917" },
  specLabel: {
    fontSize: 10,
    color: "#A89A8A",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  specDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "#EDE8E0",
    alignSelf: "center",
  },
  // Sections
  sectionBlock: { marginBottom: 28 },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: "#C4622D",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1917",
    letterSpacing: -0.2,
  },
  descText: {
    fontSize: 14,
    color: "#6B5E52",
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  readMoreText: { fontSize: 13, fontWeight: "700", color: "#C4622D" },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginBottom: 14,
  },
  locationText: { fontSize: 14, color: "#6B5E52", flex: 1, lineHeight: 20 },
  mapWrapper: {
    borderRadius: 18,
    overflow: "hidden",
    height: 200,
    borderWidth: 1,
    borderColor: "#EDE8E0",
  },
  mapExpandHint: {
    position: "absolute",
    bottom: 10,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(250,247,242,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EDE8E0",
  },
  mapExpandText: { fontSize: 11, fontWeight: "600", color: "#6B5E52" },
  // Buttons
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#25D366",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  contactBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  adminRow: { flexDirection: "row", gap: 12 },
  markSoldBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#FEF3C714",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F59E0B30",
  },
  markSoldText: { fontSize: 13, fontWeight: "600", color: "#B45309" },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#DC262610",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DC262628",
  },
  deleteText: { fontSize: 13, fontWeight: "600", color: "#DC2626" },
});
