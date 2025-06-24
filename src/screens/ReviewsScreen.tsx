import React, { useState, useEffect } from "react";
import { View, StyleSheet, RefreshControl } from "react-native";
import { Text, SearchBar, Button, Icon } from "@rneui/themed";
import ReviewsList from "../components/ReviewsList";
import {
  getAllReviews,
  getReviewsByRoaster,
  getReviewsByOrigin,
} from "../data/reviews";
import { Review } from "../types/review";

const ReviewsScreen = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "roaster" | "origin"
  >("all");

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [search, reviews, activeFilter]);

  const loadReviews = () => {
    const allReviews = getAllReviews();
    setReviews(allReviews);
    setFilteredReviews(allReviews);
  };

  const filterReviews = () => {
    let filtered = [...reviews];

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.coffeeName.toLowerCase().includes(searchLower) ||
          review.roaster.toLowerCase().includes(searchLower) ||
          review.origin.toLowerCase().includes(searchLower) ||
          review.notes.toLowerCase().includes(searchLower)
      );
    }

    setFilteredReviews(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    loadReviews();
    setRefreshing(false);
  };

  const handleReviewPress = (review: Review) => {
    // TODO: Navigate to review detail screen
    console.log("Review pressed:", review);
  };

  const clearSearch = () => {
    setSearch("");
    setActiveFilter("all");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text h4 style={styles.headerTitle}>
          Coffee Reviews
        </Text>
        <Text style={styles.headerSubtitle}>
          Discover and share coffee experiences
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search reviews..."
          onChangeText={setSearch}
          value={search}
          platform="ios"
          containerStyle={styles.searchBarContainer}
          inputContainerStyle={styles.searchBarInput}
          onClear={clearSearch}
          searchIcon={{ color: "#6F4E37" }}
          clearIcon={{ color: "#6F4E37" }}
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <Button
          title="All"
          type={activeFilter === "all" ? "solid" : "outline"}
          buttonStyle={[
            styles.filterButton,
            activeFilter === "all" && styles.activeFilterButton,
          ]}
          titleStyle={[
            styles.filterButtonText,
            activeFilter === "all" && styles.activeFilterButtonText,
          ]}
          onPress={() => setActiveFilter("all")}
        />
        <Button
          title="By Roaster"
          type={activeFilter === "roaster" ? "solid" : "outline"}
          buttonStyle={[
            styles.filterButton,
            activeFilter === "roaster" && styles.activeFilterButton,
          ]}
          titleStyle={[
            styles.filterButtonText,
            activeFilter === "roaster" && styles.activeFilterButtonText,
          ]}
          onPress={() => setActiveFilter("roaster")}
        />
        <Button
          title="By Origin"
          type={activeFilter === "origin" ? "solid" : "outline"}
          buttonStyle={[
            styles.filterButton,
            activeFilter === "origin" && styles.activeFilterButton,
          ]}
          titleStyle={[
            styles.filterButtonText,
            activeFilter === "origin" && styles.activeFilterButtonText,
          ]}
          onPress={() => setActiveFilter("origin")}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon
            name="coffee"
            type="material-community"
            size={24}
            color="#6F4E37"
          />
          <Text style={styles.statNumber}>{filteredReviews.length}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="star" type="material" size={24} color="#FFD700" />
          <Text style={styles.statNumber}>
            {filteredReviews.length > 0
              ? (
                  filteredReviews.reduce(
                    (sum, review) => sum + review.rating,
                    0
                  ) / filteredReviews.length
                ).toFixed(1)
              : "0.0"}
          </Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="store" type="material" size={24} color="#6F4E37" />
          <Text style={styles.statNumber}>
            {new Set(filteredReviews.map((review) => review.roaster)).size}
          </Text>
          <Text style={styles.statLabel}>Roasters</Text>
        </View>
      </View>

      {/* Reviews List */}
      <ReviewsList
        reviews={filteredReviews}
        onReviewPress={handleReviewPress}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: "#f8f9fa",
  },
  headerTitle: {
    color: "#6F4E37",
    textAlign: "center",
    marginBottom: 5,
  },
  headerSubtitle: {
    color: "#86939e",
    textAlign: "center",
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBarContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  searchBarInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 15,
    justifyContent: "space-around",
  },
  filterButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderColor: "#6F4E37",
    borderWidth: 1,
  },
  activeFilterButton: {
    backgroundColor: "#6F4E37",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#6F4E37",
  },
  activeFilterButtonText: {
    color: "#fff",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#86939e",
    marginTop: 2,
  },
});

export default ReviewsScreen;
