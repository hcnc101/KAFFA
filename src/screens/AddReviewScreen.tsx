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
import { Icon, Button } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { DeviceEventEmitter } from "react-native";
import { ReviewFormData } from "../types/review";
import { addReview } from "../data/reviews";
import {
  addCoffeeEntry as saveCoffeeEntry,
  CoffeeEntry,
} from "../data/coffeeEntries";
import RadarChart from "../components/RadarChart";

// Coffee types matching HomeScreen
const coffeeTypes = [
  {
    name: "Espresso",
    volume: 30,
    caffeine: 75,
    icon: "local-cafe",
    category: "black",
  },
  {
    name: "Double Espresso",
    volume: 60,
    caffeine: 150,
    icon: "local-cafe",
    category: "black",
  },
  {
    name: "Americano",
    volume: 200,
    caffeine: 150,
    icon: "coffee",
    category: "black",
  },
  {
    name: "Long Black",
    volume: 180,
    caffeine: 140,
    icon: "coffee",
    category: "black",
  },
  {
    name: "Filter Coffee",
    volume: 250,
    caffeine: 120,
    icon: "coffee",
    category: "black",
  },
  {
    name: "Cappuccino",
    volume: 180,
    caffeine: 75,
    icon: "local-cafe",
    category: "milk",
    defaultMilk: "semi-skimmed",
  },
  {
    name: "Latte",
    volume: 250,
    caffeine: 75,
    icon: "local-cafe",
    category: "milk",
    defaultMilk: "semi-skimmed",
  },
  {
    name: "Flat White",
    volume: 160,
    caffeine: 130,
    icon: "local-cafe",
    category: "milk",
    defaultMilk: "whole",
  },
  {
    name: "Cortado",
    volume: 120,
    caffeine: 75,
    icon: "local-cafe",
    category: "milk",
    defaultMilk: "whole",
  },
  {
    name: "Macchiato",
    volume: 60,
    caffeine: 75,
    icon: "local-cafe",
    category: "milk",
    defaultMilk: "semi-skimmed",
  },
  {
    name: "Mocha",
    volume: 250,
    caffeine: 95,
    icon: "local-cafe",
    category: "milk",
    defaultMilk: "whole",
  },
  {
    name: "Cold Brew",
    volume: 250,
    caffeine: 200,
    icon: "ac-unit",
    category: "black",
  },
  {
    name: "Iced Coffee",
    volume: 250,
    caffeine: 120,
    icon: "ac-unit",
    category: "black",
  },
  {
    name: "Tea (English Breakfast)",
    volume: 250,
    caffeine: 50,
    icon: "emoji-food-beverage",
    category: "black",
  },
  {
    name: "Earl Grey",
    volume: 250,
    caffeine: 45,
    icon: "emoji-food-beverage",
    category: "black",
  },
  {
    name: "Green Tea",
    volume: 250,
    caffeine: 35,
    icon: "emoji-food-beverage",
    category: "black",
  },
  {
    name: "Energy Drink",
    volume: 250,
    caffeine: 80,
    icon: "battery-charging-full",
    category: "black",
  },
];

// Milk types matching HomeScreen (with caffeine absorption effects)
const milkTypes = [
  {
    name: "No Milk",
    displayName: "No Milk",
    absorptionDelay: 0,
    caffeineReduction: 0,
    peakDelay: 0,
  },
  {
    name: "Skimmed",
    displayName: "Skimmed",
    absorptionDelay: 5,
    caffeineReduction: 0.02,
    peakDelay: 5,
  },
  {
    name: "Semi-Skimmed",
    displayName: "Semi-Skimmed",
    absorptionDelay: 8,
    caffeineReduction: 0.05,
    peakDelay: 10,
  },
  {
    name: "Whole Milk",
    displayName: "Whole Milk",
    absorptionDelay: 12,
    caffeineReduction: 0.12,
    peakDelay: 20,
  },
  {
    name: "Coconut Milk",
    displayName: "Coconut",
    absorptionDelay: 10,
    caffeineReduction: 0.08,
    peakDelay: 15,
  },
  {
    name: "Oat Milk",
    displayName: "Oat",
    absorptionDelay: 6,
    caffeineReduction: 0.03,
    peakDelay: 7,
  },
  {
    name: "Almond Milk",
    displayName: "Almond",
    absorptionDelay: 3,
    caffeineReduction: 0.01,
    peakDelay: 3,
  },
  {
    name: "Soy Milk",
    displayName: "Soy",
    absorptionDelay: 7,
    caffeineReduction: 0.04,
    peakDelay: 8,
  },
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

// Helper function to get date key (YYYY-MM-DD)
function getDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

const AddReviewScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<ReviewFormData>({
    coffeeName: "",
    roaster: "",
    origin: "",
    rating: 50, // 0-100 scale
    notes: "",
    flavour: 5, // 0-10 scale (displayed as 0-100)
    aroma: 5,
    aftertaste: 5,
    body: 5,
    acidity: 5,
    balance: 5, // replaces strength
    overall: 5,
    milkType: "None",
    keywords: [],
  });

  const [selectedCoffeeType, setSelectedCoffeeType] = useState<any>(null);
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
    if (!selectedCoffeeType) {
      Alert.alert(
        "Coffee Type Required",
        "Please select a coffee type to log."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();

      // Calculate overall rating as average of individual metrics (0-10 scale, convert to 0-100)
      const overallRating = Math.round(
        ((formData.flavour +
          formData.aroma +
          formData.aftertaste +
          formData.body +
          formData.acidity +
          formData.balance +
          formData.overall) /
          7) *
          10
      );

      const reviewData = {
        ...formData,
        rating: overallRating, // Update legacy rating
        overall: formData.overall,
      };

      // Save the review
      await addReview(reviewData);

      // Also create a coffee entry for caffeine tracking
      const selectedMilk =
        milkTypes.find((m) => m.name === formData.milkType) || milkTypes[0];
      const milkEffect = selectedMilk;
      const effectiveCaffeine =
        selectedCoffeeType.caffeine * (1 - milkEffect.caffeineReduction);
      const absorptionTime = 45 + milkEffect.peakDelay;
      const peakTime = new Date(now.getTime() + absorptionTime * 60000);
      const halfLifeTime = new Date(now.getTime() + 5.5 * 60 * 60000);

      const coffeeEntry: CoffeeEntry = {
        id: Date.now().toString(),
        type: selectedCoffeeType.name,
        volume: selectedCoffeeType.volume,
        caffeine: selectedCoffeeType.caffeine,
        effectiveCaffeine: effectiveCaffeine,
        timestamp: now,
        peakTime,
        halfLifeTime,
        dateKey: getDateKey(now),
        milkType: selectedMilk.name,
      };

      await saveCoffeeEntry(coffeeEntry);
      DeviceEventEmitter.emit("coffeeEntryAdded", coffeeEntry);

      // Reset form and stay on this screen
      resetForm();
      setSelectedCoffeeType(null);
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
      rating: 50,
      notes: "",
      flavour: 5,
      aroma: 5,
      aftertaste: 5,
      body: 5,
      acidity: 5,
      balance: 5,
      overall: 5,
      milkType: "None",
      keywords: [],
    });
    setSelectedCoffeeType(null);
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
          <Icon name="local-cafe" size={40} color="#6F4E37" />
          <Text style={styles.headerTitle}>Log Coffee</Text>
          <Text style={styles.headerSubtitle}>
            Track caffeine & add a review
          </Text>
        </View>

        {/* Coffee Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Coffee Type</Text>
          <Text style={styles.sectionSubtitle}>
            Choose the type of coffee you're drinking (required for caffeine
            tracking)
          </Text>

          <View style={styles.coffeeTypeGrid}>
            {coffeeTypes.map((coffee) => (
              <TouchableOpacity
                key={coffee.name}
                style={[
                  styles.coffeeTypeOption,
                  selectedCoffeeType?.name === coffee.name &&
                    styles.selectedCoffeeTypeOption,
                ]}
                onPress={() => {
                  setSelectedCoffeeType(coffee);
                  // Auto-set milk type if coffee has a default
                  if (coffee.defaultMilk) {
                    const defaultMilk = milkTypes.find((m) =>
                      m.name
                        .toLowerCase()
                        .includes(coffee.defaultMilk.toLowerCase())
                    );
                    if (defaultMilk) {
                      setFormData((prev) => ({
                        ...prev,
                        milkType: defaultMilk.name,
                      }));
                    }
                  }
                }}
              >
                <Icon
                  name={coffee.icon}
                  type="material"
                  color={
                    selectedCoffeeType?.name === coffee.name
                      ? "white"
                      : "#6F4E37"
                  }
                  size={24}
                />
                <Text
                  style={[
                    styles.coffeeTypeText,
                    selectedCoffeeType?.name === coffee.name &&
                      styles.selectedCoffeeTypeText,
                  ]}
                >
                  {coffee.name}
                </Text>
                <Text
                  style={[
                    styles.coffeeTypeCaffeine,
                    selectedCoffeeType?.name === coffee.name &&
                      styles.selectedCoffeeTypeCaffeine,
                  ]}
                >
                  {coffee.caffeine}mg
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coffee Details</Text>
          <Text style={styles.sectionSubtitle}>
            Fill in what you know (optional, but helps with reviews)
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

        {/* Rating Metrics - Hoffmann/SCA Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SCA Cupping Score</Text>
          <Text style={styles.sectionSubtitle}>
            Rate each attribute on a 0-10 scale (displayed as 0-100)
          </Text>
          <View style={styles.scaInfoBox}>
            <Icon name="info" size={16} color="#6F4E37" />
            <Text style={styles.scaInfoText}>
              Based on the Specialty Coffee Association (SCA) cupping protocol.
              Coffees scoring 80+ are considered specialty grade.
            </Text>
          </View>

          {[
            {
              key: "flavour",
              label: "Flavor",
              icon: "restaurant",
              description:
                "The intensity and quality of the coffee's taste profile",
            },
            {
              key: "aroma",
              label: "Aroma",
              icon: "local-florist",
              description:
                "The fragrance of the coffee, both dry and wet grounds",
            },
            {
              key: "aftertaste",
              label: "Aftertaste",
              icon: "history",
              description: "The lingering taste that remains after swallowing",
            },
            {
              key: "acidity",
              label: "Acidity",
              icon: "whatshot",
              description:
                "The bright, tangy quality that gives coffee liveliness",
            },
            {
              key: "body",
              label: "Body",
              icon: "fitness-center",
              description: "The weight and texture of the coffee in your mouth",
            },
            {
              key: "balance",
              label: "Balance",
              icon: "tune",
              description: "How harmoniously all the flavors work together",
            },
            {
              key: "overall",
              label: "Overall",
              icon: "star",
              description:
                "Your overall impression and enjoyment of this coffee",
            },
          ].map((metric) => (
            <View key={metric.key} style={styles.hoffmannRatingRow}>
              <View style={styles.hoffmannRatingHeader}>
                <View style={styles.hoffmannRatingLabel}>
                  <Icon
                    name={metric.icon}
                    size={20}
                    color="#6F4E37"
                    style={styles.ratingIcon}
                  />
                  <View style={styles.hoffmannLabelTextContainer}>
                    <Text style={styles.hoffmannRatingLabelText}>
                      {metric.label}
                    </Text>
                    <Text style={styles.hoffmannDescription}>
                      {metric.description}
                    </Text>
                  </View>
                </View>
                <Text style={styles.hoffmannScore}>
                  {(formData[metric.key as keyof ReviewFormData] as number) *
                    10}
                </Text>
              </View>
              <View style={styles.sliderContainer}>
                <View style={styles.sliderTrack}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.sliderTick,
                        (formData[
                          metric.key as keyof ReviewFormData
                        ] as number) >= value && styles.sliderTickActive,
                      ]}
                      onPress={() =>
                        updateRating(metric.key as keyof ReviewFormData, value)
                      }
                    />
                  ))}
                </View>
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>0</Text>
                  <Text style={styles.sliderLabel}>5</Text>
                  <Text style={styles.sliderLabel}>10</Text>
                </View>
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
                formData.aftertaste,
                formData.body,
                formData.acidity,
                formData.balance,
              ]}
              labels={[
                "Flavor",
                "Aroma",
                "Aftertaste",
                "Body",
                "Acidity",
                "Balance",
              ]}
              max={10}
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
            title={isSubmitting ? "Logging Coffee..." : "Log Coffee"}
            onPress={submitReview}
            disabled={isSubmitting || !selectedCoffeeType}
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
    marginTop: 15,
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  radarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6F4E37",
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  // Hoffmann-style rating components
  hoffmannRatingRow: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  hoffmannRatingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  hoffmannRatingLabel: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  hoffmannLabelTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  hoffmannRatingLabelText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    marginBottom: 4,
  },
  hoffmannDescription: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    lineHeight: 16,
  },
  hoffmannScore: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6F4E37",
    minWidth: 50,
    textAlign: "right",
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderTrack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
    paddingHorizontal: 4,
  },
  sliderTick: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
    borderWidth: 2,
    borderColor: "#BDBDBD",
  },
  sliderTickActive: {
    backgroundColor: "#6F4E37",
    borderColor: "#5A3E2A",
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: 4,
  },
  sliderLabel: {
    fontSize: 11,
    color: "#999",
    fontWeight: "500",
  },
  scaInfoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0F8FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#6F4E37",
  },
  scaInfoText: {
    flex: 1,
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    lineHeight: 16,
    fontStyle: "italic",
  },
  coffeeTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  coffeeTypeOption: {
    width: "30%",
    minWidth: 100,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCoffeeTypeOption: {
    backgroundColor: "#6F4E37",
    borderColor: "#5A3E2A",
  },
  coffeeTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginTop: 6,
    textAlign: "center",
  },
  selectedCoffeeTypeText: {
    color: "white",
  },
  coffeeTypeCaffeine: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
  },
  selectedCoffeeTypeCaffeine: {
    color: "#FFE0B2",
  },
});

export default AddReviewScreen;
