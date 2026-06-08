import { formatPrice } from "@/lib/utils";
import { Property } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const C = {
  surface: "#FFFFFF",
  border: "#EDE8E0",
  accent: "#C4622D",
  accentDim: "#C4622D18",
  text: "#1C1917",
  textMuted: "#A89A8A",
};

export default function FeaturedCard({ property }: { property: Property }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(root)/property/${property.id}`)}
      style={[styles.card, property.is_sold && { opacity: 0.55 }]}
      activeOpacity={0.92}
    >
      {/* Image */}
      <Image
        source={{ uri: property.images[0] }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Gradient overlay hint at bottom of image */}
      <View style={styles.imageOverlay} />

      {/* Type Badge */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeBadgeText}>{property.type}</Text>
      </View>

      {/* Sold Badge */}
      {property.is_sold && (
        <View style={styles.soldBadge}>
          <Text style={styles.soldBadgeText}>Sold</Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={C.textMuted} />
          <Text style={styles.locationText} numberOfLines={1}>
            {property.address}, {property.city}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(property.price)}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="bed-outline" size={12} color={C.textMuted} />
              <Text style={styles.statText}>{property.bedrooms}</Text>
            </View>
            <View style={styles.statDot} />
            <View style={styles.stat}>
              <Ionicons name="water-outline" size={12} color={C.textMuted} />
              <Text style={styles.statText}>{property.bathrooms}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 268,
    marginRight: 16,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDE8E0",
    shadowColor: "#C4622D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 168,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    // subtle fade — gives depth without hiding the image
    backgroundColor: "transparent",
  },
  typeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(250, 247, 242, 0.92)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EDE8E0",
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#C4622D",
    textTransform: "capitalize",
    letterSpacing: 0.4,
  },
  soldBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#DC2626",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  soldBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  info: {
    padding: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1C1917",
    marginBottom: 5,
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    color: "#A89A8A",
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#EDE8E0",
    marginVertical: 10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: "#C4622D",
    letterSpacing: -0.3,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontSize: 11,
    color: "#A89A8A",
    fontWeight: "500",
  },
  statDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#C9BCB0",
  },
});
