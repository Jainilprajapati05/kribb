import { PropertyType, useFilterStore } from "@/store/filterStore";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
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
  accentDim: "#C4622D14",
  accentSoft: "#C4622D30",
  text: "#1C1917",
  textMid: "#6B5E52",
  textMuted: "#A89A8A",
  textSubtle: "#C9BCB0",
  inputBg: "#FDFBF8",
};

const TYPES: { label: string; value: PropertyType }[] = [
  { label: "All", value: null },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Villa", value: "villa" },
  { label: "Studio", value: "studio" },
];

const BEDS = [
  { label: "Any", value: null },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4+", value: 4 },
];

const PRICE_PRESETS = [
  { label: "Under ₹50L", min: null, max: 5000000 },
  { label: "₹50L – ₹1Cr", min: 5000000, max: 10000000 },
  { label: "₹1Cr – ₹2Cr", min: 10000000, max: 20000000 },
  { label: "Above ₹2Cr", min: 20000000, max: null },
];

export default function FilterModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const {
    type,
    bedrooms,
    minPrice,
    maxPrice,
    setType,
    setBedrooms,
    setMinPrice,
    setMaxPrice,
    resetFilters,
  } = useFilterStore();

  const [localMin, setLocalMin] = useState(minPrice ? String(minPrice) : "");
  const [localMax, setLocalMax] = useState(maxPrice ? String(maxPrice) : "");

  const activeCount = [type, bedrooms, minPrice, maxPrice].filter(
    (v) => v !== null,
  ).length;

  const handleApply = () => {
    setMinPrice(localMin ? Number(localMin) : null);
    setMaxPrice(localMax ? Number(localMax) : null);
    onClose();
  };

  const handleReset = () => {
    setLocalMin("");
    setLocalMax("");
    resetFilters();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={C.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.headerAccentBar} />
            <Text style={styles.headerTitle}>Filters</Text>
          </View>
          <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Property Type */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Property Type</Text>
            <View style={styles.chipRow}>
              {TYPES.map((item) => {
                const active = type === item.value;
                return (
                  <TouchableOpacity
                    key={String(item.value)}
                    onPress={() => setType(item.value)}
                    style={[styles.chip, active && styles.chipActive]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Bedrooms */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Bedrooms</Text>
            <View style={styles.bedsRow}>
              {BEDS.map((item) => {
                const active = bedrooms === item.value;
                return (
                  <TouchableOpacity
                    key={String(item.value)}
                    onPress={() => setBedrooms(item.value)}
                    style={[styles.bedChip, active && styles.bedChipActive]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.bedChipText,
                        active && styles.bedChipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Price Range</Text>

            <View style={styles.priceInputsRow}>
              {[
                {
                  label: "Min Price",
                  value: localMin,
                  onChange: setLocalMin,
                  placeholder: "0",
                },
                {
                  label: "Max Price",
                  value: localMax,
                  onChange: setLocalMax,
                  placeholder: "Any",
                },
              ].map(({ label, value, onChange, placeholder }) => (
                <View key={label} style={styles.priceInputWrapper}>
                  <Text style={styles.priceInputLabel}>{label}</Text>
                  <View style={styles.priceInputRow}>
                    <Text style={styles.pricePrefix}>₹</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder={placeholder}
                      placeholderTextColor={C.textSubtle}
                      keyboardType="numeric"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Price Presets */}
            <View style={styles.presetsRow}>
              {PRICE_PRESETS.map((p) => {
                const active = minPrice === p.min && maxPrice === p.max;
                return (
                  <TouchableOpacity
                    key={p.label}
                    onPress={() => {
                      setLocalMin(p.min ? String(p.min) : "");
                      setLocalMax(p.max ? String(p.max) : "");
                      setMinPrice(p.min);
                      setMaxPrice(p.max);
                    }}
                    style={[styles.preset, active && styles.presetActive]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        active && styles.presetTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleApply}
            style={styles.applyBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.applyBtnText}>
              Apply{activeCount > 0 ? ` (${activeCount} active)` : " Filters"}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FAF7F2" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EDE8E0",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FAF7F2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EDE8E0",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerAccentBar: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: "#C4622D",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1C1917",
    letterSpacing: -0.3,
  },
  resetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#C4622D14",
    borderWidth: 1,
    borderColor: "#C4622D30",
  },
  resetText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#C4622D",
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1C1917",
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EDE8E0",
    backgroundColor: "#FFFFFF",
  },
  chipActive: {
    backgroundColor: "#C4622D",
    borderColor: "#C4622D",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#A89A8A",
  },
  chipTextActive: { color: "#FFFFFF" },
  bedsRow: { flexDirection: "row", gap: 8 },
  bedChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EDE8E0",
    backgroundColor: "#FFFFFF",
  },
  bedChipActive: {
    backgroundColor: "#C4622D",
    borderColor: "#C4622D",
  },
  bedChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#A89A8A",
  },
  bedChipTextActive: { color: "#FFFFFF" },
  priceInputsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  priceInputWrapper: { flex: 1 },
  priceInputLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#A89A8A",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDFBF8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EDE8E0",
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  pricePrefix: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C4622D",
    marginRight: 4,
  },
  priceInput: { flex: 1, fontSize: 14, color: "#1C1917" },
  presetsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  preset: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EDE8E0",
    backgroundColor: "#FFFFFF",
  },
  presetActive: {
    backgroundColor: "#C4622D14",
    borderColor: "#C4622D40",
  },
  presetText: { fontSize: 12, fontWeight: "500", color: "#6B5E52" },
  presetTextActive: { color: "#C4622D", fontWeight: "700" },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 36,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EDE8E0",
  },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#C4622D",
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: "#C4622D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.2,
  },
});
