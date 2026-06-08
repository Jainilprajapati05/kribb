import { useSupabase } from "@/hooks/useSupabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
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
  inputBg: "#FDFBF8",
};

const TYPES = ["apartment", "house", "villa", "studio"] as const;
type PropertyType = (typeof TYPES)[number];
const MIN_PRICE = 1;
const MAX_PRICE = 999_999_999;

interface FormState {
  title: string;
  description: string;
  price: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  areaSqft: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  isFeatured: boolean;
  images: string[];
  localImages: string[];
}

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  price: "",
  type: "apartment",
  bedrooms: 1,
  bathrooms: 1,
  areaSqft: "",
  address: "",
  city: "",
  latitude: "",
  longitude: "",
  isFeatured: false,
  images: [],
  localImages: [],
};

export default function CreatePropertyScreen() {
  const router = useRouter();
  const authSupabase = useSupabase();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const updateForm = (fields: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  const handlePickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
      selectionLimit: 6,
    });
    if (result.canceled) return;
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    const previewUris: string[] = [];
    for (const asset of result.assets) {
      try {
        const filename = `property_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
        const base64 = asset.base64!;
        const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const { error } = await authSupabase.storage
          .from("property-images")
          .upload(filename, buffer, {
            contentType: "image/jpeg",
            upsert: false,
          });
        if (error) throw error;
        const { data: urlData } = authSupabase.storage
          .from("property-images")
          .getPublicUrl(filename);
        uploadedUrls.push(urlData.publicUrl);
        previewUris.push(asset.uri);
      } catch (err) {
        console.error("Upload error:", err);
        Alert.alert("Upload Failed", "One or more images failed to upload.");
      }
    }
    updateForm({
      images: [...form.images, ...uploadedUrls],
      localImages: [...form.localImages, ...previewUris],
    });
    setUploadingImages(false);
  };

  const handleRemoveImage = (index: number) => {
    updateForm({
      images: form.images.filter((_, i) => i !== index),
      localImages: form.localImages.filter((_, i) => i !== index),
    });
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      updateForm({
        latitude: String(location.coords.latitude),
        longitude: String(location.coords.longitude),
      });
    } catch {
      Alert.alert("Error", "Could not detect location. Enter manually.");
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim())
      return Alert.alert("Validation", "Title is required.");
    if (!form.price.trim())
      return Alert.alert("Validation", "Price is required.");
    const priceNum = Number(form.price);
    if (isNaN(priceNum) || priceNum < MIN_PRICE)
      return Alert.alert("Validation", "Price must be greater than ₹0.");
    if (priceNum > MAX_PRICE)
      return Alert.alert(
        "Validation",
        `Price cannot exceed ₹${MAX_PRICE.toLocaleString("en-IN")}.`,
      );
    if (!form.address.trim())
      return Alert.alert("Validation", "Address is required.");
    if (!form.city.trim())
      return Alert.alert("Validation", "City is required.");
    if (form.images.length === 0)
      return Alert.alert("Validation", "Please upload at least one image.");
    setSubmitting(true);
    const { error } = await authSupabase.from("properties").insert({
      title: form.title.trim(),
      description: form.description.trim(),
      price: priceNum,
      type: form.type,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      area_sqft: form.areaSqft ? Number(form.areaSqft) : null,
      address: form.address.trim(),
      city: form.city.trim(),
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      images: form.images,
      is_featured: form.isFeatured,
      is_sold: false,
    });
    setSubmitting(false);
    if (error) {
      Alert.alert("Error", "Failed to create property. Please try again.");
      console.error(error);
      return;
    }
    setForm(INITIAL_FORM);
    Alert.alert("Listed! 🎉", "Your property is now live.", [
      { text: "Done", onPress: () => router.replace("/(root)/(tabs)") },
    ]);
  };

  const Counter = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
  }) => (
    <View style={styles.counterWrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity
          onPress={() => onChange(Math.max(1, value - 1))}
          style={styles.counterBtn}
        >
          <Ionicons name="remove" size={16} color={C.accent} />
        </TouchableOpacity>
        <Text style={styles.counterValue}>{value}</Text>
        <TouchableOpacity
          onPress={() => onChange(value + 1)}
          style={styles.counterBtn}
        >
          <Ionicons name="add" size={16} color={C.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const Toggle = ({
    label,
    value,
    onChange,
    description,
  }: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
    description?: string;
  }) => (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      style={[styles.toggleRow, value && styles.toggleRowActive]}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={[styles.toggleLabel, value && { color: C.accent }]}>
          {label}
        </Text>
        {description && <Text style={styles.toggleDesc}>{description}</Text>}
      </View>
      <View style={[styles.toggleCheck, value && styles.toggleCheckActive]}>
        {value && <Ionicons name="checkmark" size={13} color="#fff" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.accentBar} />
            <Text style={styles.title}>Add Property</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photos */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Photos</Text>
            <View style={styles.photosGrid}>
              {form.localImages.map((uri, index) => (
                <View key={index} style={styles.photoThumb}>
                  <Image
                    source={{ uri }}
                    style={styles.thumbImage}
                    resizeMode="cover"
                  />
                  {index === 0 && (
                    <View style={styles.coverBadge}>
                      <Text style={styles.coverBadgeText}>COVER</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(index)}
                    style={styles.removeBtn}
                  >
                    <Ionicons name="close" size={10} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {form.localImages.length < 6 && (
                <TouchableOpacity
                  onPress={handlePickImages}
                  disabled={uploadingImages}
                  style={styles.addPhotoBtn}
                  activeOpacity={0.7}
                >
                  {uploadingImages ? (
                    <ActivityIndicator size="small" color={C.accent} />
                  ) : (
                    <>
                      <Ionicons
                        name="camera-outline"
                        size={20}
                        color={C.textMuted}
                      />
                      <Text style={styles.addPhotoText}>Add</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.hintText}>
              First photo becomes the cover · Up to 6 photos
            </Text>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Details</Text>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Modern 3BHK in Bandra"
              placeholderTextColor={C.textSubtle}
              value={form.title}
              onChangeText={(v) => updateForm({ title: v })}
            />
            <Text style={[styles.label, { marginTop: 14 }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Describe the property..."
              placeholderTextColor={C.textSubtle}
              value={form.description}
              onChangeText={(v) => updateForm({ description: v })}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Price */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Price</Text>
            <View style={styles.prefixInputRow}>
              <Text style={styles.inputPrefix}>₹</Text>
              <TextInput
                style={styles.prefixInput}
                placeholder="0"
                placeholderTextColor={C.textSubtle}
                value={form.price}
                onChangeText={(v) => updateForm({ price: v })}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.hintText}>
              Valid range: ₹1 – ₹{MAX_PRICE.toLocaleString("en-IN")}
            </Text>
          </View>

          {/* Type */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Property Type</Text>
            <View style={styles.typeRow}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => updateForm({ type: t })}
                  style={[
                    styles.typeChip,
                    form.type === t && styles.typeChipActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      form.type === t && styles.typeChipTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rooms */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Rooms</Text>
            <View style={styles.counterPair}>
              <Counter
                label="Bedrooms"
                value={form.bedrooms}
                onChange={(v) => updateForm({ bedrooms: v })}
              />
              <View style={{ width: 14 }} />
              <Counter
                label="Bathrooms"
                value={form.bathrooms}
                onChange={(v) => updateForm({ bathrooms: v })}
              />
            </View>
          </View>

          {/* Area */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Area</Text>
            <View style={styles.prefixInputRow}>
              <TextInput
                style={styles.prefixInput}
                placeholder="e.g. 1200"
                placeholderTextColor={C.textSubtle}
                value={form.areaSqft}
                onChangeText={(v) => updateForm({ areaSqft: v })}
                keyboardType="numeric"
              />
              <Text style={styles.inputSuffix}>sq ft</Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Location</Text>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Street address"
              placeholderTextColor={C.textSubtle}
              value={form.address}
              onChangeText={(v) => updateForm({ address: v })}
            />
            <Text style={[styles.label, { marginTop: 14 }]}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mumbai"
              placeholderTextColor={C.textSubtle}
              value={form.city}
              onChangeText={(v) => updateForm({ city: v })}
            />
            <View style={styles.coordsHeader}>
              <Text style={styles.label}>Coordinates</Text>
              <TouchableOpacity
                onPress={handleDetectLocation}
                disabled={detectingLocation}
                style={styles.detectBtn}
                activeOpacity={0.8}
              >
                {detectingLocation ? (
                  <ActivityIndicator size="small" color={C.accent} />
                ) : (
                  <Ionicons name="locate-outline" size={13} color={C.accent} />
                )}
                <Text style={styles.detectBtnText}>
                  {detectingLocation ? "Detecting..." : "Auto-detect"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Latitude"
                placeholderTextColor={C.textSubtle}
                value={form.latitude}
                onChangeText={(v) => updateForm({ latitude: v })}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Longitude"
                placeholderTextColor={C.textSubtle}
                value={form.longitude}
                onChangeText={(v) => updateForm({ longitude: v })}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Options */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Options</Text>
            <Toggle
              label="Featured Property"
              description="Show this in the Featured section on home"
              value={form.isFeatured}
              onChange={(v) => updateForm({ isFeatured: v })}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || uploadingImages}
            style={[
              styles.submitBtn,
              (submitting || uploadingImages) && { opacity: 0.6 },
            ]}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>List Property</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAF7F2" },
  header: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 14 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  accentBar: {
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: "#C4622D",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1C1917",
    letterSpacing: -0.6,
  },
  scrollContent: { padding: 20, paddingBottom: 120 },
  section: { marginBottom: 26 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1C1917",
    marginBottom: 12,
    letterSpacing: 0.1,
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
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#1C1917",
  },
  textarea: { height: 96, paddingTop: 12 },
  hintText: { fontSize: 11, color: "#C9BCB0", marginTop: 6 },
  prefixInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDFBF8",
    borderWidth: 1,
    borderColor: "#EDE8E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  inputPrefix: {
    fontSize: 16,
    fontWeight: "700",
    color: "#C4622D",
    marginRight: 6,
  },
  inputSuffix: {
    fontSize: 13,
    color: "#A89A8A",
    marginLeft: 8,
    fontWeight: "500",
  },
  prefixInput: { flex: 1, fontSize: 14, color: "#1C1917" },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EDE8E0",
    backgroundColor: "#FFFFFF",
  },
  typeChipActive: { backgroundColor: "#C4622D", borderColor: "#C4622D" },
  typeChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#A89A8A",
    textTransform: "capitalize",
    letterSpacing: 0.2,
  },
  typeChipTextActive: { color: "#FFFFFF" },
  counterPair: { flexDirection: "row" },
  counterWrapper: { flex: 1 },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDFBF8",
    borderWidth: 1,
    borderColor: "#EDE8E0",
    borderRadius: 12,
    overflow: "hidden",
  },
  counterBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C4622D14",
  },
  counterValue: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
    color: "#1C1917",
  },
  coordsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 7,
  },
  detectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#C4622D14",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C4622D30",
  },
  detectBtnText: { fontSize: 11, fontWeight: "600", color: "#C4622D" },
  photosGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  photoThumb: { position: "relative" },
  thumbImage: { width: 92, height: 92, borderRadius: 14 },
  coverBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#C4622D",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FAF7F2",
  },
  addPhotoBtn: {
    width: 92,
    height: 92,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#EDE8E0",
    borderStyle: "dashed",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addPhotoText: { fontSize: 11, color: "#A89A8A", fontWeight: "500" },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EDE8E0",
    backgroundColor: "#FFFFFF",
  },
  toggleRowActive: { borderColor: "#C4622D30", backgroundColor: "#C4622D08" },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1C1917",
    marginBottom: 2,
  },
  toggleDesc: { fontSize: 11, color: "#A89A8A", lineHeight: 16 },
  toggleCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#EDE8E0",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleCheckActive: { backgroundColor: "#C4622D", borderColor: "#C4622D" },
  submitBtn: {
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
    shadowRadius: 14,
    elevation: 6,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.2,
  },
});
