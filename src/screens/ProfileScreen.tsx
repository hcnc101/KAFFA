import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, Avatar, Card, Button } from "@rneui/themed";

const ProfileScreen = () => {
  // Mock user data - will be replaced with real data later
  const user = {
    name: "Coffee Enthusiast",
    username: "@coffeelover",
    reviewCount: 42,
    following: 120,
    followers: 89,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar
          size={100}
          rounded
          icon={{ name: "person", type: "material" }}
          containerStyle={styles.avatar}
        />
        <Text h4>{user.name}</Text>
        <Text style={styles.username}>{user.username}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text h4>{user.reviewCount}</Text>
          <Text>Reviews</Text>
        </View>
        <View style={styles.statItem}>
          <Text h4>{user.following}</Text>
          <Text>Following</Text>
        </View>
        <View style={styles.statItem}>
          <Text h4>{user.followers}</Text>
          <Text>Followers</Text>
        </View>
      </View>

      <Text h4 style={styles.sectionTitle}>
        Your Recent Reviews
      </Text>

      <Card>
        <Card.Title>Ethiopian Yirgacheffe</Card.Title>
        <Card.Divider />
        <Text style={styles.rating}>★★★★☆</Text>
        <Text>
          A bright, complex coffee with floral notes and citrus undertones.
        </Text>
        <Text style={styles.date}>2 days ago</Text>
      </Card>

      <Card>
        <Card.Title>House Blend</Card.Title>
        <Card.Divider />
        <Text style={styles.rating}>★★★★★</Text>
        <Text>Perfect morning coffee. Balanced and smooth.</Text>
        <Text style={styles.date}>5 days ago</Text>
      </Card>

      <Button
        title="Edit Profile"
        type="outline"
        buttonStyle={styles.editButton}
        titleStyle={{ color: "#6F4E37" }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    padding: 20,
  },
  avatar: {
    backgroundColor: "#6F4E37",
    marginBottom: 10,
  },
  username: {
    color: "#666",
    marginTop: 5,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  statItem: {
    alignItems: "center",
  },
  sectionTitle: {
    margin: 15,
    color: "#6F4E37",
  },
  rating: {
    fontSize: 16,
    color: "#6F4E37",
    marginVertical: 5,
  },
  date: {
    color: "#666",
    fontSize: 12,
    marginTop: 10,
    textAlign: "right",
  },
  editButton: {
    margin: 15,
    borderColor: "#6F4E37",
  },
});

export default ProfileScreen;
