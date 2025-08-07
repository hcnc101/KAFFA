import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Icon } from "@rneui/themed";

const AddReviewScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Icon name="local-cafe" size={80} color="#8B4513" style={styles.icon} />
        <Text style={styles.title}>Add Coffee</Text>
        <Text style={styles.subtitle}>Coming Soon!</Text>
        <Text style={styles.description}>
          This is where you'll be able to log your coffee consumption and add
          reviews for different coffee types.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#C4A484",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default AddReviewScreen;
