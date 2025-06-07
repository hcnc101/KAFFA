import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Text, Card, Button, Icon, Image, Divider } from "@rneui/themed";

const SCREEN_WIDTH = Dimensions.get("window").width;

// Theme colors
const theme = {
  primary: "#6F4E37", // Coffee brown
  secondary: "#C4A484", // Lighter brown
  background: "#FFFFFF",
  surface: "#F5F5F5",
  accent: "#D4AF37", // Gold
  text: "#333333",
  textLight: "#666666",
};

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon
            name="search"
            type="material"
            size={20}
            color={theme.textLight}
          />
          <TextInput
            placeholder="Search any coffee..."
            style={styles.searchInput}
            placeholderTextColor={theme.textLight}
          />
        </View>
      </View>

      {/* New Feature Card */}
      <TouchableOpacity style={styles.newFeatureCard}>
        <View style={styles.newFeatureContent}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            }}
            style={styles.newFeatureImage}
          />
          <View style={styles.newFeatureTextContainer}>
            <View style={styles.newTag}>
              <Text style={styles.newTagText}>New!</Text>
            </View>
            <Text style={styles.newFeatureTitle}>Food pairing search</Text>
            <Text style={styles.newFeatureSubtitle}>
              Find the perfect coffee for your meal
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Coffee Categories */}
      <Text style={styles.sectionTitle}>Shop coffee by type</Text>
      <View style={styles.categoriesGrid}>
        {["Light Roast", "Medium Roast", "Dark Roast", "Espresso"].map(
          (category) => (
            <TouchableOpacity key={category} style={styles.categoryCard}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                }}
                style={styles.categoryImage}
              />
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Best Offers */}
      <TouchableOpacity style={styles.offersCard}>
        <Icon
          name="local-offer"
          type="material"
          color={theme.primary}
          size={24}
        />
        <Text style={styles.offersText}>Shop our best offers</Text>
        <Icon
          name="chevron-right"
          type="material"
          color={theme.primary}
          size={24}
        />
      </TouchableOpacity>

      {/* Coffee Origins */}
      <Text style={styles.sectionTitle}>Coffee origins</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.originsContainer}
      >
        {[
          {
            name: "Ethiopia",
            image:
              "https://images.unsplash.com/photo-150004575050-6dbc0df9e5f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Colombia",
            image:
              "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Brazil",
            image:
              "https://images.unsplash.com/photo-1542478050-9c2d0e17b723?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          },
        ].map((origin) => (
          <TouchableOpacity key={origin.name} style={styles.originCard}>
            <Image
              source={{
                uri: origin.image,
              }}
              style={styles.originImage}
            />
            <Text style={styles.originName}>{origin.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* View Map Button */}
      <TouchableOpacity style={styles.mapCard}>
        <Icon name="map" type="material" color={theme.primary} size={24} />
        <View style={styles.mapTextContainer}>
          <Text style={styles.mapTitle}>View Map</Text>
          <Text style={styles.mapSubtitle}>
            Find roasters and cafes near you
          </Text>
        </View>
        <Icon
          name="chevron-right"
          type="material"
          color={theme.primary}
          size={24}
        />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 12,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
    color: theme.text,
  },
  newFeatureCard: {
    margin: 15,
    backgroundColor: theme.background,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newFeatureContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  newFeatureImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  newFeatureTextContainer: {
    flex: 1,
    padding: 15,
  },
  newTag: {
    backgroundColor: theme.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  newTagText: {
    color: theme.background,
    fontWeight: "bold",
    fontSize: 12,
  },
  newFeatureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 4,
  },
  newFeatureSubtitle: {
    fontSize: 14,
    color: theme.textLight,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
    marginTop: 20,
    marginBottom: 15,
    color: theme.text,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 7.5,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 45) / 2,
    height: 120,
    margin: 7.5,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: theme.background,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  categoryText: {
    color: theme.background,
    fontSize: 18,
    fontWeight: "bold",
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.3)",
    height: "100%",
  },
  offersCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5EE",
    margin: 15,
    padding: 15,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  offersText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
    color: theme.primary,
  },
  originsContainer: {
    paddingLeft: 15,
  },
  originCard: {
    width: 160,
    height: 120,
    marginRight: 15,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  originImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  originName: {
    color: theme.background,
    fontSize: 18,
    fontWeight: "bold",
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.3)",
    height: "100%",
  },
  mapCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.background,
    margin: 15,
    padding: 15,
    borderRadius: 16,
    marginBottom: 30,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.text,
  },
  mapSubtitle: {
    fontSize: 14,
    color: theme.textLight,
  },
});

export default HomeScreen;
