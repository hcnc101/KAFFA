import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  Input,
  Button,
  AirbnbRating,
  Icon,
  ButtonGroup,
} from "@rneui/themed";
import { addReview } from "../data/reviews";
import { ReviewFormData } from "../types/review";

const milkTypes = ["None", "Dairy", "Oat", "Almond", "Soya"];

const AddReviewScreen = () => {
  const [coffeeName, setCoffeeName] = useState("");
  const [roaster, setRoaster] = useState("");
  const [origin, setOrigin] = useState("");
  const [notes, setNotes] = useState("");
  // Multi-metric states
  const [flavour, setFlavour] = useState(5);
  const [aroma, setAroma] = useState(5);
  const [body, setBody] = useState(5);
  const [acidity, setAcidity] = useState(5);
  const [strength, setStrength] = useState(5);
  const [overall, setOverall] = useState(3);
  const [milkTypeIdx, setMilkTypeIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    if (!coffeeName.trim()) {
      Alert.alert("Error", "Please enter a coffee name");
      return false;
    }
    if (!roaster.trim()) {
      Alert.alert("Error", "Please enter a roaster");
      return false;
    }
    if (!origin.trim()) {
      Alert.alert("Error", "Please enter an origin");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const reviewData: ReviewFormData = {
        coffeeName: coffeeName.trim(),
        roaster: roaster.trim(),
        origin: origin.trim(),
        notes: notes.trim(),
        // Multi-metric
        flavour,
        aroma,
        body,
        acidity,
        strength,
        overall,
        rating: overall, // for legacy compatibility
        milkType: milkTypes[milkTypeIdx],
      };
      const newReview = addReview(reviewData);
      Alert.alert(
        "Success!",
        `Your review for ${newReview.coffeeName} has been added.`,
        [
          {
            text: "OK",
            onPress: () => {
              setCoffeeName("");
              setRoaster("");
              setOrigin("");
              setNotes("");
              setFlavour(5);
              setAroma(5);
              setBody(5);
              setAcidity(5);
              setStrength(5);
              setOverall(3);
              setMilkTypeIdx(0);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = coffeeName.trim() && roaster.trim() && origin.trim();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Icon
            name="coffee"
            type="material-community"
            size={40}
            color="#6F4E37"
            style={styles.headerIcon}
          />
          <Text h4 style={styles.headerText}>
            Add Coffee Review
          </Text>
          <Text style={styles.subtitle}>
            Share your coffee experience with the community
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Coffee Name *"
            value={coffeeName}
            onChangeText={setCoffeeName}
            placeholder="e.g. Ethiopian Yirgacheffe"
            leftIcon={
              <Icon
                name="coffee"
                type="material-community"
                size={20}
                color="#86939e"
              />
            }
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Roaster *"
            value={roaster}
            onChangeText={setRoaster}
            placeholder="e.g. Stumptown Coffee"
            leftIcon={
              <Icon name="store" type="material" size={20} color="#86939e" />
            }
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Origin *"
            value={origin}
            onChangeText={setOrigin}
            placeholder="e.g. Ethiopia, Colombia"
            leftIcon={
              <Icon name="public" type="material" size={20} color="#86939e" />
            }
            containerStyle={styles.inputContainer}
          />

          {/* Multi-metric sliders */}
          <Text style={styles.metricLabel}>Flavour</Text>
          <SliderWithValue value={flavour} setValue={setFlavour} />
          <Text style={styles.metricLabel}>Aroma</Text>
          <SliderWithValue value={aroma} setValue={setAroma} />
          <Text style={styles.metricLabel}>Body</Text>
          <SliderWithValue value={body} setValue={setBody} />
          <Text style={styles.metricLabel}>Acidity</Text>
          <SliderWithValue value={acidity} setValue={setAcidity} />
          <Text style={styles.metricLabel}>Strength</Text>
          <SliderWithValue value={strength} setValue={setStrength} />

          {/* Milk type selector */}
          <Text style={styles.metricLabel}>Milk Type</Text>
          <ButtonGroup
            buttons={milkTypes}
            selectedIndex={milkTypeIdx}
            onPress={setMilkTypeIdx}
            containerStyle={styles.milkTypeGroup}
            selectedButtonStyle={styles.selectedMilkType}
            textStyle={styles.milkTypeText}
          />

          {/* Overall star rating */}
          <Text style={styles.metricLabel}>Overall</Text>
          <AirbnbRating
            count={5}
            reviews={["Terrible", "Meh", "OK", "Good", "Amazing"]}
            defaultRating={overall}
            size={30}
            onFinishRating={setOverall}
            selectedColor="#6F4E37"
            reviewColor="#6F4E37"
            reviewSize={16}
          />

          <Input
            label="Tasting Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Describe the flavor, aroma, body, acidity, and finish..."
            multiline
            numberOfLines={4}
            leftIcon={
              <Icon name="edit" type="material" size={20} color="#86939e" />
            }
            containerStyle={styles.inputContainer}
            inputStyle={styles.notesInput}
          />

          <Button
            title={isSubmitting ? "Submitting..." : "Submit Review"}
            onPress={handleSubmit}
            buttonStyle={[
              styles.submitButton,
              !isFormValid && styles.disabledButton,
            ]}
            disabled={!isFormValid || isSubmitting}
            loading={isSubmitting}
            icon={
              <Icon
                name="send"
                type="material"
                color="white"
                size={20}
                style={{ marginRight: 10 }}
              />
            }
          />

          <Text style={styles.requiredNote}>* Required fields</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// SliderWithValue component for 1-10 sliders
import { Slider } from "@rneui/themed";
const SliderWithValue = ({
  value,
  setValue,
}: {
  value: number;
  setValue: (v: number) => void;
}) => (
  <View
    style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
  >
    <Slider
      value={value}
      onValueChange={setValue}
      minimumValue={1}
      maximumValue={10}
      step={1}
      thumbStyle={{ height: 24, width: 24, backgroundColor: "#6F4E37" }}
      trackStyle={{ height: 6, borderRadius: 3 }}
      style={{ flex: 1 }}
      minimumTrackTintColor="#6F4E37"
      maximumTrackTintColor="#d3d3d3"
    />
    <Text
      style={{
        width: 32,
        textAlign: "center",
        color: "#6F4E37",
        fontWeight: "bold",
      }}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
  },
  headerIcon: {
    marginBottom: 10,
  },
  headerText: {
    textAlign: "center",
    color: "#6F4E37",
    marginBottom: 5,
  },
  subtitle: {
    textAlign: "center",
    color: "#86939e",
    fontSize: 16,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  metricLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6F4E37",
    marginTop: 10,
    marginBottom: 2,
    marginLeft: 2,
  },
  milkTypeGroup: {
    marginBottom: 15,
    borderRadius: 10,
    height: 40,
  },
  selectedMilkType: {
    backgroundColor: "#6F4E37",
  },
  milkTypeText: {
    fontSize: 14,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#6F4E37",
    borderRadius: 25,
    paddingVertical: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: "#d3d3d3",
  },
  requiredNote: {
    textAlign: "center",
    color: "#86939e",
    fontSize: 12,
    fontStyle: "italic",
  },
});

export default AddReviewScreen;
