import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, Input, Button, AirbnbRating } from "@rneui/themed";

const AddReviewScreen = () => {
  const [coffeeName, setCoffeeName] = useState("");
  const [roaster, setRoaster] = useState("");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [origin, setOrigin] = useState("");

  const handleSubmit = () => {
    // TODO: Implement review submission
    console.log({ coffeeName, roaster, rating, notes, origin });
  };

  return (
    <ScrollView style={styles.container}>
      <Text h4 style={styles.header}>
        Add Coffee Review
      </Text>

      <View style={styles.form}>
        <Input
          label="Coffee Name"
          value={coffeeName}
          onChangeText={setCoffeeName}
          placeholder="e.g. Ethiopian Yirgacheffe"
        />

        <Input
          label="Roaster"
          value={roaster}
          onChangeText={setRoaster}
          placeholder="e.g. Stumptown Coffee"
        />

        <Input
          label="Origin"
          value={origin}
          onChangeText={setOrigin}
          placeholder="e.g. Ethiopia, Colombia"
        />

        <Text style={styles.ratingLabel}>Rating</Text>
        <AirbnbRating
          count={5}
          reviews={["Terrible", "Meh", "OK", "Good", "Amazing"]}
          defaultRating={0}
          size={30}
          onFinishRating={setRating}
          selectedColor="#6F4E37"
        />

        <Input
          label="Tasting Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Describe the flavor, aroma, body..."
          multiline
          numberOfLines={4}
        />

        <Button
          title="Submit Review"
          onPress={handleSubmit}
          buttonStyle={styles.submitButton}
          disabled={!coffeeName || !roaster || !rating}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    textAlign: "center",
    marginVertical: 20,
    color: "#6F4E37",
  },
  form: {
    padding: 15,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#86939e",
    marginLeft: 10,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#6F4E37",
    marginTop: 20,
  },
});

export default AddReviewScreen;
