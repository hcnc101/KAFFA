/**
 * AddReviewScreen.tsx
 *
 * CS50 FINAL PROJECT - KAFFA COFFEE TRACKER
 * ==========================================
 *
 * PURPOSE:
 * This screen serves a DUAL FUNCTION:
 * 1. Logs caffeine intake for the real-time metabolism tracker (HomeScreen)
 * 2. Records detailed coffee reviews using SCA (Specialty Coffee Association) cupping protocol
 *
 * KEY FEATURES:
 * - 17 pre-defined coffee types with accurate caffeine values
 * - 8 milk types that affect caffeine absorption rates
 * - Professional 7-attribute cupping score system (SCA standard)
 * - Live radar chart visualization of flavor profile
 * - Auto-complete suggestions for roasters and origins
 * - Flexible validation (only requires ONE of: name, roaster, or origin)
 *
 * TECHNICAL CONCEPTS:
 * - React Hooks (useState) for form state management
 * - TypeScript interfaces for type safety
 * - DeviceEventEmitter for cross-screen communication
 * - AsyncStorage persistence (via imported functions)
 * - Custom SVG radar chart component
 *
 * DESIGN DECISIONS:
 * - Combined logging + reviewing in one screen to reduce friction
 * - SCA protocol chosen as industry standard for coffee evaluation
 * - Flexible validation because users may only know partial info about their coffee
 *
 * @author Holly Souza-Newman
 * @course CS50 Final Project
 */

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
import { DeviceEventEmitter } from "react-native"; // For cross-screen event communication
import { ReviewFormData } from "../types/review"; // TypeScript interface for type safety
import { addReview } from "../data/reviews"; // Persistence function for reviews
import {
  addCoffeeEntry as saveCoffeeEntry,
  CoffeeEntry,
} from "../data/coffeeEntries"; // Persistence function for caffeine tracking
import RadarChart from "../components/RadarChart"; // Custom SVG visualization component

/**
 * COFFEE TYPES DATABASE
 * =====================
 *
 * Each coffee type is defined with:
 * - name: Display name for the UI
 * - volume: British measurement in milliliters (mL)
 * - caffeine: Milligrams of caffeine per serving (researched values)
 * - icon: Material Design icon name for visual identification
 * - category: "black" or "milk" - determines if milk selection is shown
 * - defaultMilk: (optional) Auto-selects this milk type when coffee is chosen
 *
 * CAFFEINE VALUES SOURCE:
 * Values are based on average measurements from:
 * - USDA Food Database
 * - Specialty Coffee Association standards
 * - European Food Safety Authority reports
 *
 * NOTE: This array is duplicated from HomeScreen.tsx to maintain
 * consistency. In a production app, this would be in a shared constants file.
 */
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

/**
 * MILK TYPES WITH CAFFEINE ABSORPTION EFFECTS
 * ============================================
 *
 * THE SCIENCE:
 * Milk affects caffeine absorption because:
 * 1. Fat content slows gastric emptying (caffeine takes longer to reach bloodstream)
 * 2. Proteins bind to caffeine molecules, reducing effective absorption
 * 3. Calcium can interfere with caffeine's interaction with adenosine receptors
 *
 * Each milk type is modeled with:
 * - absorptionDelay: Minutes added before caffeine starts absorbing
 * - caffeineReduction: Percentage of caffeine that's effectively "lost" (0.12 = 12%)
 * - peakDelay: Additional minutes until caffeine reaches peak concentration
 *
 * EXAMPLE CALCULATION:
 * Flat White (130mg caffeine) + Whole Milk (12% reduction, 20min delay):
 * - Effective caffeine: 130 * (1 - 0.12) = 114.4mg
 * - Time to peak: 45min (base) + 20min (milk) = 65 minutes
 *
 * This models real pharmacokinetic behavior where fats/proteins slow absorption.
 */
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

/**
 * AUTO-COMPLETE SUGGESTIONS
 * =========================
 *
 * These arrays provide typeahead suggestions to:
 * 1. Speed up data entry for users
 * 2. Improve data consistency (standardized spellings)
 * 3. Help users discover coffee origins they might not know
 *
 * ORIGINS: Top 10 coffee-producing countries by specialty coffee quality
 * - Ethiopia: Birthplace of coffee, known for fruity/floral notes
 * - Colombia: Balanced, medium body, nutty/caramel notes
 * - Brazil: World's largest producer, chocolate/nut profiles
 * - Kenya: Bright acidity, berry/citrus notes
 * - Jamaica: Famous for Blue Mountain, mild and smooth
 * - Yemen: Historic producer, wine-like, complex
 */
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

/**
 * ROASTERS: Mix of well-known specialty roasters
 * - Third-wave coffee pioneers (Stumptown, Blue Bottle, Intelligentsia)
 * - UK-based roasters (Square Mile, Monmouth, Workshop, Ozone)
 * - Generic options for local/unknown roasters
 */
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

/**
 * Helper function to generate a date key string
 * Used for grouping coffee entries by day in the tracker
 *
 * @param date - JavaScript Date object
 * @returns String in format "YYYY-MM-DD" (e.g., "2024-12-15")
 */
function getDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * MAIN COMPONENT: AddReviewScreen
 * ================================
 *
 * This is a FUNCTIONAL COMPONENT using React Hooks for state management.
 *
 * WHY FUNCTIONAL VS CLASS COMPONENT?
 * - Hooks provide cleaner, more readable code
 * - Easier to share stateful logic between components
 * - Better performance with React's optimization
 * - Industry standard for modern React development
 */
const AddReviewScreen = () => {
  const navigation = useNavigation();

  /**
   * FORM STATE MANAGEMENT
   * ---------------------
   * Using a single useState object for all form fields (controlled components pattern)
   *
   * RATING SCALES:
   * - Individual metrics (flavour, aroma, etc.): 0-10 scale internally
   * - Displayed to user as 0-100 (multiplied by 10) to match SCA standards
   * - Overall rating: Calculated as average of all metrics
   *
   * WHY 0-10 INTERNALLY?
   * - Easier math for averaging
   * - More intuitive for the tap-to-rate UI (11 tick marks: 0-10)
   * - Converts cleanly to 0-100 for display
   */
  const [formData, setFormData] = useState<ReviewFormData>({
    coffeeName: "",
    roaster: "",
    origin: "",
    rating: 50, // Legacy field, now calculated from metrics
    notes: "",
    // SCA CUPPING ATTRIBUTES (all default to 5/10 = neutral)
    flavour: 5, // Taste quality and complexity
    aroma: 5, // Fragrance of dry and wet grounds
    aftertaste: 5, // Lingering taste after swallowing
    body: 5, // Weight/texture in mouth (mouthfeel)
    acidity: 5, // Brightness, liveliness (NOT sourness)
    balance: 5, // Harmony of all attributes together
    overall: 5, // Subjective overall impression
    milkType: "None",
    keywords: [], // Reserved for future tagging feature
  });

  // Currently selected coffee type (required for caffeine tracking)
  const [selectedCoffeeType, setSelectedCoffeeType] = useState<any>(null);

  // UI state for auto-complete dropdown visibility
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showRoasterSuggestions, setShowRoasterSuggestions] = useState(false);

  // Prevents double-submission while async operations complete
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * STATE UPDATE FUNCTIONS
   * ----------------------
   * These use the functional update pattern: (prev) => newState
   * This ensures we always have the latest state when updating,
   * avoiding race conditions with rapid user interactions.
   */

  // Updates numeric rating fields (0-10 scale)
  const updateRating = (field: keyof ReviewFormData, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Updates text fields (name, roaster, origin, notes)
  const updateField = (field: keyof ReviewFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Updates milk type selection
  const selectMilkType = (milkType: string) => {
    setFormData((prev) => ({ ...prev, milkType }));
  };

  /**
   * FORM VALIDATION
   * ===============
   *
   * DESIGN DECISION: Flexible validation
   *
   * Rather than requiring ALL fields, we only require ONE identifier.
   *
   * USE CASES THIS SUPPORTS:
   * 1. User at a café: Knows roaster name but not the specific bean
   * 2. Gift coffee: Knows origin (Ethiopia) but not roaster
   * 3. Home brewing: Knows the coffee name but forgot origin
   *
   * The coffee TYPE is separately required (for caffeine tracking).
   *
   * @returns boolean - true if form is valid, false otherwise
   */
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

  /**
   * SUBMIT REVIEW FUNCTION
   * ======================
   *
   * This is the CORE FUNCTION of the screen - it performs DUAL SAVES:
   * 1. Saves the coffee REVIEW to the reviews database
   * 2. Creates a CAFFEINE ENTRY for the real-time tracker
   *
   * ASYNC/AWAIT PATTERN:
   * - Uses try/catch for error handling
   * - setIsSubmitting prevents double-clicks during async operations
   * - finally block ensures loading state is cleared even on error
   *
   * CROSS-SCREEN COMMUNICATION:
   * DeviceEventEmitter.emit() notifies HomeScreen to update its display
   * without requiring a page reload or prop drilling
   */
  const submitReview = async () => {
    // VALIDATION CHECKS
    if (!validateForm()) return;
    if (!selectedCoffeeType) {
      Alert.alert(
        "Coffee Type Required",
        "Please select a coffee type to log."
      );
      return;
    }

    setIsSubmitting(true); // Show loading indicator, disable button
    try {
      const now = new Date();

      /**
       * RATING CALCULATION
       * ------------------
       * Average of all 7 SCA metrics, converted from 0-10 to 0-100 scale
       *
       * MATH: (sum of 7 metrics / 7) * 10 = 0-100 score
       *
       * Example: All metrics at 8/10 = (8*7/7)*10 = 80/100
       * This matches SCA's "specialty grade" threshold of 80+
       */
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
        ...formData, // Spread operator copies all form fields
        rating: overallRating, // Override with calculated rating
        overall: formData.overall,
      };

      // SAVE #1: Store the review in persistent storage
      await addReview(reviewData);

      /**
       * CAFFEINE TRACKING CALCULATIONS
       * ------------------------------
       *
       * 1. Find the selected milk type's absorption effects
       * 2. Calculate EFFECTIVE caffeine (after milk reduction)
       * 3. Calculate PEAK TIME (base 45min + milk delay)
       * 4. Calculate HALF-LIFE TIME (5.5 hours from now)
       */
      const selectedMilk =
        milkTypes.find((m) => m.name === formData.milkType) || milkTypes[0];
      const milkEffect = selectedMilk;

      // Effective caffeine = base caffeine * (1 - reduction percentage)
      // Example: 130mg * (1 - 0.12) = 114.4mg with whole milk
      const effectiveCaffeine =
        selectedCoffeeType.caffeine * (1 - milkEffect.caffeineReduction);

      // Time to peak concentration in bloodstream
      // Base: 45 minutes (average for caffeine absorption)
      // Plus: milk delay (fats slow absorption)
      const absorptionTime = 45 + milkEffect.peakDelay;

      // Calculate future timestamps for tracking
      const peakTime = new Date(now.getTime() + absorptionTime * 60000); // Convert minutes to milliseconds
      const halfLifeTime = new Date(now.getTime() + 5.5 * 60 * 60000); // 5.5 hours in milliseconds

      /**
       * COFFEE ENTRY OBJECT
       * -------------------
       * This is saved to the caffeine tracking database
       * and used by HomeScreen to calculate real-time caffeine levels
       */
      const coffeeEntry: CoffeeEntry = {
        id: Date.now().toString(), // Unique ID using timestamp
        type: selectedCoffeeType.name, // "Flat White", "Espresso", etc.
        volume: selectedCoffeeType.volume, // in mL
        caffeine: selectedCoffeeType.caffeine, // Original caffeine content
        effectiveCaffeine: effectiveCaffeine, // After milk absorption effects
        timestamp: now, // When the coffee was logged
        peakTime, // When caffeine will peak
        halfLifeTime, // When 50% will remain
        dateKey: getDateKey(now), // "2024-12-15" for daily grouping
        milkType: selectedMilk.name, // For display and recalculation
      };

      // SAVE #2: Store the caffeine entry for tracker
      await saveCoffeeEntry(coffeeEntry);

      /**
       * EVENT EMISSION
       * --------------
       * DeviceEventEmitter is React Native's pub/sub system
       *
       * HomeScreen listens for "coffeeEntryAdded" events
       * When received, it updates its state to show the new entry
       *
       * This avoids prop drilling or complex state management libraries
       */
      DeviceEventEmitter.emit("coffeeEntryAdded", coffeeEntry);

      // Reset form for next entry (stays on this screen)
      resetForm();
      setSelectedCoffeeType(null);
    } catch (error) {
      // Error handling - shows native alert dialog
      Alert.alert("Error", "Failed to save review. Please try again.");
    } finally {
      // Always runs - ensures button is re-enabled
      setIsSubmitting(false);
    }
  };

  /**
   * RESET FORM
   * ----------
   * Clears all form fields back to default values
   * Called after successful submission or via "Reset Form" button
   *
   * All ratings reset to 5/10 (neutral) rather than 0 to encourage
   * users to think about each attribute relative to "average"
   */
  const resetForm = () => {
    setFormData({
      coffeeName: "",
      roaster: "",
      origin: "",
      rating: 50,
      notes: "",
      flavour: 5, // Neutral default
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

  /**
   * RENDER METHOD
   * =============
   *
   * COMPONENT STRUCTURE:
   * 1. KeyboardAvoidingView - Lifts content when keyboard opens (iOS)
   * 2. ScrollView - Allows scrolling through the long form
   * 3. Header - Coffee icon and title
   * 4. Sections:
   *    - Coffee Type Selection (17-item grid)
   *    - Coffee Details (name, roaster, origin with autocomplete)
   *    - Milk Type Selection (8-item horizontal scroll)
   *    - SCA Cupping Scores (7 metrics with custom slider)
   *    - Radar Chart (live SVG visualization)
   *    - Tasting Notes (multiline text input)
   *    - Submit/Reset buttons
   */
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

        {/* 
          COFFEE TYPE SELECTION GRID
          ==========================
          - Displays all 17 coffee types in a responsive 3-column grid
          - Each card shows: icon, name, caffeine content
          - Selecting a milk-based coffee auto-sets the default milk type
          - Visual feedback: selected card changes to brown background
        */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Coffee Type</Text>
          <Text style={styles.sectionSubtitle}>
            Choose the type of coffee you're drinking (required for caffeine
            tracking)
          </Text>

          <View style={styles.coffeeTypeGrid}>
            {/* MAP: Iterate through coffeeTypes array, render a card for each */}
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

        {/* 
          SCA CUPPING SCORE SECTION
          =========================
          
          WHAT IS SCA?
          The Specialty Coffee Association is the global authority on
          coffee quality standards. Their cupping protocol is used by:
          - Professional coffee buyers
          - Competition judges
          - Quality control at roasteries
          
          SCORING SCALE:
          - 0-10 internal (for easier UI)
          - Displayed as 0-100 to match SCA standards
          - 80+ = Specialty Grade
          - 85+ = Excellent
          - 90+ = Outstanding
          
          THE 7 ATTRIBUTES:
          Based on James Hoffmann's simplified version of SCA protocol
        */}
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

          {/* 
            RATING METRICS ARRAY
            --------------------
            Each metric includes:
            - key: Maps to formData field name
            - label: Display name
            - icon: Material Design icon
            - description: Explains what to evaluate
          */}
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

          {/* 
            RADAR CHART VISUALIZATION
            =========================
            
            WHY A RADAR CHART?
            - Creates a unique "flavor fingerprint" for each coffee
            - Users can instantly compare shape profiles
            - Visual learners understand balance at a glance
            
            LIVE UPDATES:
            The chart re-renders whenever formData changes
            React's diffing algorithm only updates what changed
            
            CUSTOM COMPONENT:
            Built from scratch using react-native-svg because:
            - No good radar chart libraries for React Native
            - Needed custom styling to match app theme
            - Required specific label positioning logic
            
            PROPS EXPLAINED:
            - values: Array of 6 rating values (0-10)
            - labels: Array of 6 attribute names
            - max: Maximum value (10) for scaling
            - size: Pixel dimensions of the chart
            - caption: Helper text below chart
          */}
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

/**
 * STYLESHEET
 * ==========
 *
 * DESIGN SYSTEM:
 * - Primary color: #6F4E37 (Coffee brown)
 * - Background: #fff (White)
 * - Secondary background: #f8f9fa (Light gray)
 * - Text: #333 (Dark gray)
 * - Muted text: #666, #999 (Medium/light gray)
 * - Border: #E0E0E0 (Light gray)
 *
 * SPACING SYSTEM:
 * - Section margins: 20px horizontal, 15px vertical
 * - Input padding: 12px
 * - Border radius: 8px (inputs), 12px (cards), 20px (pills)
 *
 * TYPOGRAPHY:
 * - Headers: 18-24px, bold
 * - Body: 16px
 * - Captions: 12-14px, italic
 */
const styles = StyleSheet.create({
  // Main container - fills entire screen
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
  /**
   * HOFFMANN-STYLE RATING COMPONENTS
   * --------------------------------
   * Named after James Hoffmann (YouTube coffee educator)
   * who popularized simplified SCA scoring for home users
   *
   * Design emphasizes:
   * - Clear attribute labels with descriptions
   * - Large tap targets for easy interaction
   * - Visual score display (number + filled circles)
   */
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
  /**
   * CUSTOM SLIDER/TICK RATING SYSTEM
   * --------------------------------
   * Instead of a traditional slider, uses 11 tappable circles (0-10)
   *
   * WHY THIS DESIGN?
   * - More precise than dragging a slider
   * - Clear discrete values (no 7.3 scores)
   * - Works well on touch screens
   * - Visual feedback shows cumulative selection
   *
   * INTERACTION: Tap any circle to set that rating
   * All circles <= selected value become "active" (filled brown)
   */
  sliderContainer: {
    marginTop: 8,
  },
  sliderTrack: {
    flexDirection: "row", // Horizontal layout
    alignItems: "center",
    justifyContent: "space-between", // Even spacing
    height: 40,
    paddingHorizontal: 4,
  },
  sliderTick: {
    width: 24,
    height: 24,
    borderRadius: 12, // Perfect circle
    backgroundColor: "#E0E0E0", // Inactive state
    borderWidth: 2,
    borderColor: "#BDBDBD",
  },
  sliderTickActive: {
    backgroundColor: "#6F4E37", // Coffee brown when active
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
  /**
   * COFFEE TYPE GRID
   * ----------------
   * Responsive 3-column grid using flexWrap
   *
   * width: "30%" + gap: 10 creates 3 columns with spacing
   * minWidth: 100 prevents cards from being too small on narrow screens
   */
  coffeeTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap", // Allows items to wrap to next row
    gap: 10, // Modern gap property for spacing
    marginTop: 10,
  },
  coffeeTypeOption: {
    width: "30%", // ~3 columns accounting for gap
    minWidth: 100, // Minimum readable width
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
