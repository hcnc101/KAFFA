import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Icon, AirbnbRating, Button } from "@rneui/themed";
import { ReviewFormData } from "../types/review";
import { addReview } from "../data/reviews";
import RadarChart from "../components/RadarChart";

// Milk types matching HomeScreen
const milkTypes = [
  { name: "None", displayName: "No Milk" },
  { name: "Skimmed", displayName: "Skimmed" },
  { name: "Semi-Skimmed", displayName: "Semi-Skimmed" },
  { name: "Whole Milk", displayName: "Whole Milk" },
  { name: "Coconut Milk", displayName: "Coconut" },
  { name: "Oat Milk", displayName: "Oat" },
  { name: "Almond Milk", displayName: "Almond" },
  { name: "Soy Milk", displayName: "Soy" },
];

const popularOrigins = [
  "Ethiopia",
  "Colombia",
  "Brazil",
  "Guatemala",
  "Kenya",
  "Honduras",
  "Peru",
  "Costa Rica",
  "Jamaica",
  "Yemen",
];

const popularRoasters = [
  "Stumptown Coffee",
  "Blue Bottle Coffee",
  "Intelligentsia Coffee",
  "Counter Culture Coffee",
  "Square Mile Coffee",
  "Monmouth Coffee",
  "Workshop Coffee",
  "Ozone Coffee",
  "Local Roaster",
  "Other",
];

const AddReviewScreen = () => {
  const [formData, setFormData] = useState<ReviewFormData>({
    coffeeName: "",
    roaster: "",
    origin: "",
    rating: 5, // legacy field
    notes: "",
    flavour: 5,
    aroma: 5,
    body: 5,
    acidity: 5,
    strength: 5,
    overall: 5,
    milkType: "None",
    keywords: [],
  });

  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showRoasterSuggestions, setShowRoasterSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateRating = (field: keyof ReviewFormData, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateField = (field: keyof ReviewFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectMilkType = (milkType: string) => {
    setFormData((prev) => ({ ...prev, milkType }));
  };

  const validateForm = (): boolean => {
    // At least one of these fields must be filled
    const hasBasicInfo =
      formData.coffeeName.trim() ||
      formData.roaster.trim() ||
      formData.origin.trim();

    if (!hasBasicInfo) {
      Alert.alert(
        "Missing Information",
        "Please enter at least a coffee name, roaster, or origin"
      );
      return false;
    }
    return true;
  };

  const submitReview = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Calculate overall rating as average of individual metrics
      const overallRating = Math.round(
        (formData.flavour +
          formData.aroma +
          formData.body +
          formData.acidity +
          formData.strength +
          formData.overall) /
          6
      );

      const reviewData = {
        ...formData,
        rating: overallRating, // Update legacy rating
        overall: formData.overall,
      };

      await addReview(reviewData);

      Alert.alert(
        "Review Saved!",
        "Your coffee review has been added successfully.",
        [{ text: "OK", onPress: resetForm }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      coffeeName: "",
      roaster: "",
      origin: "",
      rating: 5,
      notes: "",
      flavour: 5,
      aroma: 5,
      body: 5,
      acidity: 5,
      strength: 5,
      overall: 5,
      milkType: "None",
      keywords: [],
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Icon name="rate-review" size={40} color="#6F4E37" />
          <Text style={styles.headerTitle}>Add Coffee Review</Text>
          <Text style={styles.headerSubtitle}>
            Share your coffee experience
          </Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coffee Details</Text>
          <Text style={styles.sectionSubtitle}>
            Fill in what you know (at least one field required)
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Coffee Name</Text>
            <TextInput
              style={styles.textInput}
              value={formData.coffeeName}
              onChangeText={(text) => updateField("coffeeName", text)}
              placeholder="e.g., Ethiopian Yirgacheffe"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Roaster</Text>
            <View style={styles.autocompleteContainer}>
              <TextInput
                style={styles.textInput}
                value={formData.roaster}
                onChangeText={(text) => updateField("roaster", text)}
                onFocus={() => setShowRoasterSuggestions(true)}
                onBlur={() =>
                  setTimeout(() => setShowRoasterSuggestions(false), 200)
                }
                placeholder="e.g., Stumptown Coffee"
                placeholderTextColor="#999"
              />
              {showRoasterSuggestions && (
                <View style={styles.suggestions}>
                  {popularRoasters
                    .filter((r) =>
                      r.toLowerCase().includes(formData.roaster.toLowerCase())
                    )
                    .slice(0, 5)
                    .map((roaster) => (
                      <TouchableOpacity
                        key={roaster}
                        style={styles.suggestionItem}
                        onPress={() => {
                          updateField("roaster", roaster);
                          setShowRoasterSuggestions(false);
                        }}
                      >
                        <Text style={styles.suggestionText}>{roaster}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Origin</Text>
            <View style={styles.autocompleteContainer}>
              <TextInput
                style={styles.textInput}
                value={formData.origin}
                onChangeText={(text) => updateField("origin", text)}
                onFocus={() => setShowOriginSuggestions(true)}
                onBlur={() =>
                  setTimeout(() => setShowOriginSuggestions(false), 200)
                }
                placeholder="e.g., Ethiopia"
                placeholderTextColor="#999"
              />
              {showOriginSuggestions && (
                <View style={styles.suggestions}>
                  {popularOrigins
                    .filter((o) =>
                      o.toLowerCase().includes(formData.origin.toLowerCase())
                    )
                    .slice(0, 5)
                    .map((origin) => (
                      <TouchableOpacity
                        key={origin}
                        style={styles.suggestionItem}
                        onPress={() => {
                          updateField("origin", origin);
                          setShowOriginSuggestions(false);
                        }}
                      >
                        <Text style={styles.suggestionText}>{origin}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Milk Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Milk Type</Text>
          <View style={styles.milkTypeContainer}>
            {milkTypes.map((milk) => (
              <TouchableOpacity
                key={milk.name}
                style={[
                  styles.milkTypeOption,
                  formData.milkType === milk.name && styles.selectedMilkType,
                ]}
                onPress={() => selectMilkType(milk.name)}
              >
                <Text
                  style={[
                    styles.milkTypeText,
                    formData.milkType === milk.name &&
                      styles.selectedMilkTypeText,
                  ]}
                >
                  {milk.displayName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rating Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rating Breakdown</Text>

          {[
            { key: "flavour", label: "Flavour", icon: "restaurant" },
            { key: "aroma", label: "Aroma", icon: "local-florist" },
            { key: "body", label: "Body", icon: "fitness-center" },
            { key: "acidity", label: "Acidity", icon: "whatshot" },
            { key: "strength", label: "Strength", icon: "flash-on" },
            { key: "overall", label: "Overall", icon: "star" },
          ].map((metric) => (
            <View key={metric.key} style={styles.ratingRow}>
              <View style={styles.ratingLabel}>
                <Icon
                  name={metric.icon}
                  size={20}
                  color="#6F4E37"
                  style={styles.ratingIcon}
                />
                <Text style={styles.ratingLabelText}>{metric.label}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <AirbnbRating
                  count={5}
                  defaultRating={
                    formData[metric.key as keyof ReviewFormData] as number
                  }
                  size={24}
                  showRating={false}
                  selectedColor="#6F4E37"
                  onFinishRating={(rating) =>
                    updateRating(metric.key as keyof ReviewFormData, rating)
                  }
                />
                <Text style={styles.ratingValue}>
                  {formData[metric.key as keyof ReviewFormData]}/5
                </Text>
              </View>
            </View>
          ))}

          {/* Flavor Profile Visualization */}
          <View style={styles.radarContainer}>
            <Text style={styles.radarTitle}>Flavor Profile</Text>
            <RadarChart
              values={[
                formData.flavour,
                formData.aroma,
                formData.body,
                formData.acidity,
                formData.strength,
              ]}
              labels={["Flavour", "Aroma", "Body", "Acidity", "Strength"]}
              max={5}
              size={320}
              caption="Live preview of your coffee's flavor profile"
            />
          </View>
        </View>

        {/* Tasting Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasting Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={formData.notes}
            onChangeText={(text) => updateField("notes", text)}
            placeholder="Describe the flavors, aromas, and your overall experience..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={isSubmitting ? "Saving Review..." : "Save Review"}
            onPress={submitReview}
            disabled={isSubmitting}
            buttonStyle={styles.submitButton}
            titleStyle={styles.submitButtonText}
            loading={isSubmitting}
          />

          <Button
            title="Reset Form"
            onPress={resetForm}
            type="outline"
            buttonStyle={styles.resetButton}
            titleStyle={styles.resetButtonText}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6F4E37",
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#86939e",
    marginTop: 5,
  },
  section: {
    marginHorizontal: 20,
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    fontStyle: "italic",
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  autocompleteContainer: {
    position: "relative",
  },
  suggestions: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 150,
    zIndex: 1000,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
  },
  milkTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  milkTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#6F4E37",
    backgroundColor: "#fff",
  },
  selectedMilkType: {
    backgroundColor: "#6F4E37",
  },
  milkTypeText: {
    fontSize: 14,
    color: "#6F4E37",
  },
  selectedMilkTypeText: {
    color: "#fff",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  ratingLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  ratingIcon: {
    marginRight: 8,
  },
  ratingLabelText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ratingValue: {
    fontSize: 14,
    color: "#666",
    minWidth: 30,
    textAlign: "center",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  submitButton: {
    backgroundColor: "#6F4E37",
    borderRadius: 8,
    paddingVertical: 15,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  resetButton: {
    borderColor: "#6F4E37",
    borderRadius: 8,
    paddingVertical: 15,
  },
  resetButtonText: {
    color: "#6F4E37",
    fontSize: 16,
  },
  bottomPadding: {
    height: 20,
  },
  radarContainer: {
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  radarTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
});

export default AddReviewScreen;
