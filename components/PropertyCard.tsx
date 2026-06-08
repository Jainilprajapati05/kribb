import { useSavedProperty } from "@/hooks/useSavedProperty";
import { formatPrice } from "@/lib/utils";
import { Property } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const C = {
  surface: "#FFFFFF",
  border: "#EDE8E0",
  accent: "#C4622D",
  accentDim: "#C4622D14",
  text: "#1C1917",
  textMid: "#6B5E52",
  textMuted: "#A89A8A",
  textSubtle: "#C9BCB0",
};

export default function PropertyCard({
  property,
  onUnsave,
  showSave = false,
}: {
  property: Property;
  onUnsave?: () => void;
  showSave?: boolean;
}) {
  const router = useRouter();
  const { isSaved, saveLoading, toggleSave } = useSavedProperty(
    property.id,
    onUnsave,
  );

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(root)/property/${property.id}`)}
      style={[styles.card, property.is_sold && { opacity: 0.55 }]}
      activeOpacity={0.9}
    >
      {/* Image */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: property.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Type pill over image */}
        <View style={styles.typePill}>
          <Text style={styles.typePillText}>{property.type}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={11} color={C.textMuted} />
          <Text style={styles.locationText} numberOfLines={1}>
            {property.city}
          </Text>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>{formatPrice(property.price)}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons name="bed-outline" size={10} color={C.textMuted} />
                <Text style={styles.statText}>{property.bedrooms} bd</Text>
              </View>
              {property.area_sqft ? (
                <>
                  <View style={styles.statDot} />
                  <View style={styles.stat}>
                    <Ionicons
                      name="expand-outline"
                      size={10}
                      color={C.textMuted}
                    />
                    <Text style={styles.statText}>
                      {property.area_sqft} ft²
                    </Text>
                  </View>
                </>
              ) : null}
            </View>
          </View>

          {property.is_sold && (
            <View style={styles.soldBadge}>
              <Text style={styles.soldBadgeText}>Sold</Text>
            </View>
          )}
        </View>
      </View>

      {/* Save Button */}
      {showSave && (
        <TouchableOpacity
          onPress={toggleSave}
          disabled={saveLoading}
          style={styles.saveBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isSaved ? "heart" : "heart-outline"}
            size={18}
            color={isSaved ? "#C4622D" : C.textSubtle}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EDE8E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: 110,
    height: 110,
  },
  typePill: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(250, 247, 242, 0.90)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EDE8E0",
  },
  typePillText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#C4622D",
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },
  info: {
    flex: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1C1917",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 11,
    color: "#A89A8A",
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: "#C4622D",
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontSize: 10,
    color: "#A89A8A",
    fontWeight: "500",
  },
  statDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#C9BCB0",
  },
  soldBadge: {
    backgroundColor: "#DC262614",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DC262628",
  },
  soldBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#DC2626",
  },
  saveBtn: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: "#EDE8E0",
  },
});
