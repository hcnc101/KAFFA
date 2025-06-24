import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, Input, Button, AirbnbRating, Icon } from "@rneui/themed";
import { addReview } from "../data/reviews";
import { ReviewFormData } from "../types/review";

const AddReviewScreen = () => {
  const [coffeeName, setCoffeeName] = useState("");
  const [roaster, setRoaster] = useState("");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [origin, setOrigin] = useState("");
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
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating");
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
        rating,
        notes: notes.trim(),
      };

      const newReview = addReview(reviewData);

      // Show success message
      Alert.alert(
        "Success!",
        `Your review for ${newReview.coffeeName} has been added.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              setCoffeeName("");
              setRoaster("");
              setOrigin("");
              setRating(0);
              setNotes("");
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

  const isFormValid =
    coffeeName.trim() && roaster.trim() && rating > 0 && origin.trim();

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

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Rating *</Text>
            <AirbnbRating
              count={5}
              reviews={["Terrible", "Meh", "OK", "Good", "Amazing"]}
              defaultRating={0}
              size={30}
              onFinishRating={setRating}
              selectedColor="#6F4E37"
              reviewColor="#6F4E37"
              reviewSize={16}
            />
          </View>

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
  ratingContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#86939e",
    marginBottom: 15,
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
