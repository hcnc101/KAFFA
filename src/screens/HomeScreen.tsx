import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, Card } from "@rneui/themed";

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text h1 style={styles.header}>
        Espressoo
      </Text>
      <Text h4 style={styles.subheader}>
        Recent Reviews
      </Text>

      {/* Sample review cards - later we'll make these dynamic */}
      <Card>
        <Card.Title>Ethiopian Yirgacheffe</Card.Title>
        <Card.Divider />
        <Text style={styles.rating}>Rating: ★★★★☆</Text>
        <Text>
          A bright, complex coffee with floral notes and citrus undertones.
        </Text>
        <Text style={styles.reviewer}>by CoffeeLover123</Text>
      </Card>

      <Card>
        <Card.Title>Colombian Dark Roast</Card.Title>
        <Card.Divider />
        <Text style={styles.rating}>Rating: ★★★★★</Text>
        <Text>
          Rich and full-bodied with chocolate notes and a smooth finish.
        </Text>
        <Text style={styles.reviewer}>by BeanMaster</Text>
      </Card>
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
  subheader: {
    marginLeft: 15,
    marginBottom: 10,
    color: "#6F4E37",
  },
  rating: {
    fontSize: 16,
    color: "#6F4E37",
    marginVertical: 5,
  },
  reviewer: {
    marginTop: 10,
    textAlign: "right",
    fontStyle: "italic",
    color: "#666",
  },
});

export default HomeScreen;
