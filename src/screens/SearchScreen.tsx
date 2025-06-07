import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Text, Icon, Image } from "@rneui/themed";

const SCREEN_WIDTH = Dimensions.get("window").width;

const theme = {
  primary: "#8B4513",
  secondary: "#C4A484",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#333333",
  textLight: "#666666",
};

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches] = useState([
    "Ethiopian coffee",
    "Light roast",
    "Blue Bottle",
    "Pour over",
  ]);

  const categories = [
    {
      name: "Roasters",
      icon: "store",
      color: "#FFB74D",
    },
    {
      name: "Beans",
      icon: "coffee",
      color: "#8D6E63",
    },
    {
      name: "Brewing",
      icon: "local-cafe",
      color: "#4DB6AC",
    },
    {
      name: "Equipment",
      icon: "shopping-bag",
      color: "#7986CB",
    },
  ];

  const trendingCoffees = [
    {
      id: 1,
      name: "Blue Bottle Hayes Valley Espresso",
      image:
        "https://images.unsplash.com/photo-1587734361993-0275024cb0b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      roaster: "Blue Bottle Coffee",
      price: "$19.99",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Stumptown Hair Bender",
      image:
        "https://images.unsplash.com/photo-1559525839-825fb034eb27?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      roaster: "Stumptown Coffee",
      price: "$16.99",
      rating: 4.7,
    },
    {
      id: 3,
      name: "Counter Culture Apollo",
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      roaster: "Counter Culture",
      price: "$17.99",
      rating: 4.9,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon
            name="search"
            type="material"
            size={24}
            color={theme.textLight}
          />
          <TextInput
            placeholder="Search coffees, roasters, or equipment..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.textLight}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon
                name="close"
                type="material"
                size={24}
                color={theme.textLight}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Recent Searches */}
      {searchQuery.length === 0 && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <View style={styles.recentSearches}>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentSearchItem}
                  onPress={() => setSearchQuery(search)}
                >
                  <Icon
                    name="history"
                    type="material"
                    size={16}
                    color={theme.textLight}
                    style={styles.recentSearchIcon}
                  />
                  <Text style={styles.recentSearchText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse Categories</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.name}
                  style={styles.categoryCard}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: category.color },
                    ]}
                  >
                    <Icon
                      name={category.icon}
                      type="material"
                      size={24}
                      color="white"
                    />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Trending Now */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.trendingContainer}
            >
              {trendingCoffees.map((coffee) => (
                <TouchableOpacity key={coffee.id} style={styles.trendingCard}>
                  <Image
                    source={{ uri: coffee.image }}
                    style={styles.trendingImage}
                  />
                  <View style={styles.trendingInfo}>
                    <Text style={styles.trendingName} numberOfLines={2}>
                      {coffee.name}
                    </Text>
                    <Text style={styles.trendingRoaster}>{coffee.roaster}</Text>
                    <View style={styles.trendingBottom}>
                      <Text style={styles.trendingPrice}>{coffee.price}</Text>
                      <View style={styles.ratingContainer}>
                        <Icon
                          name="star"
                          type="material"
                          size={16}
                          color="#FFD700"
                        />
                        <Text style={styles.ratingText}>{coffee.rating}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: theme.text,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
    marginBottom: 15,
    color: theme.text,
  },
  recentSearches: {
    paddingHorizontal: 15,
  },
  recentSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  recentSearchIcon: {
    marginRight: 10,
  },
  recentSearchText: {
    fontSize: 16,
    color: theme.text,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 7.5,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    margin: 7.5,
    padding: 15,
    backgroundColor: theme.background,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.text,
    textAlign: "center",
  },
  trendingContainer: {
    paddingLeft: 15,
  },
  trendingCard: {
    width: 200,
    backgroundColor: theme.background,
    borderRadius: 12,
    marginRight: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trendingImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  trendingInfo: {
    padding: 12,
  },
  trendingName: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 4,
  },
  trendingRoaster: {
    fontSize: 14,
    color: theme.textLight,
    marginBottom: 8,
  },
  trendingBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trendingPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.primary,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
    color: theme.text,
  },
});

export default SearchScreen;
