import React, { useState, useEffect } from "react";
import { View, StyleSheet, RefreshControl } from "react-native";
import { Text, SearchBar, Icon } from "@rneui/themed";
import { useFocusEffect } from "@react-navigation/native";
import ReviewsList from "../components/ReviewsList";
import { getAllReviews, loadReviews } from "../data/reviews";
import { Review } from "../types/review";

// Theme - matching the app's coffee aesthetic
const theme = {
  primary: "#8B4513",
  secondary: "#C4A484",
  background: "#FAF8F5",
  surface: "#FFFFFF",
  accent: "#D4AF37",
  text: "#2C1810",
  textLight: "#6B5344",
  cream: "#F5E6D3",
};

const ReviewsScreen = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshReviews();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refreshReviews();
    }, [])
  );

  useEffect(() => {
    filterReviews();
  }, [search, reviews]);

  const refreshReviews = async () => {
    await loadReviews();
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
    await refreshReviews();
    setRefreshing(false);
  };

  const handleReviewPress = (review: Review) => {
    console.log("Review pressed:", review);
  };

  const clearSearch = () => {
    setSearch("");
  };

  // Calculate stats
  const avgRating =
    filteredReviews.length > 0
      ? (
          filteredReviews.reduce((sum, review) => sum + review.rating, 0) /
          filteredReviews.length
        ).toFixed(0)
      : "0";

  const uniqueRoasters = new Set(
    filteredReviews.map((review) => review.roaster)
  ).size;
  const uniqueOrigins = new Set(filteredReviews.map((review) => review.origin))
    .size;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon
            name="rate-review"
            type="material"
            size={28}
            color={theme.surface}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Coffee Reviews</Text>
            <Text style={styles.headerSubtitle}>Your tasting journal</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search by name, roaster, or origin..."
          onChangeText={setSearch}
          value={search}
          platform="ios"
          containerStyle={styles.searchBarContainer}
          inputContainerStyle={styles.searchBarInput}
          inputStyle={styles.searchBarText}
          onClear={clearSearch}
          searchIcon={{ color: theme.primary, size: 20 }}
          clearIcon={{ color: theme.primary }}
        />
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Icon
              name="coffee"
              type="material-community"
              size={18}
              color={theme.surface}
            />
          </View>
          <Text style={styles.statNumber}>{filteredReviews.length}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View
            style={[
              styles.statIconContainer,
              { backgroundColor: theme.accent },
            ]}
          >
            <Icon name="star" type="material" size={18} color={theme.surface} />
          </View>
          <Text style={styles.statNumber}>{avgRating}</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View
            style={[
              styles.statIconContainer,
              { backgroundColor: theme.secondary },
            ]}
          >
            <Icon
              name="store"
              type="material"
              size={18}
              color={theme.surface}
            />
          </View>
          <Text style={styles.statNumber}>{uniqueRoasters}</Text>
          <Text style={styles.statLabel}>Roasters</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View
            style={[styles.statIconContainer, { backgroundColor: "#6B8E6B" }]}
          >
            <Icon
              name="public"
              type="material"
              size={18}
              color={theme.surface}
            />
          </View>
          <Text style={styles.statNumber}>{uniqueOrigins}</Text>
          <Text style={styles.statLabel}>Origins</Text>
        </View>
      </View>

      {/* Reviews List */}
      <View style={styles.listContainer}>
        <ReviewsList
          reviews={filteredReviews}
          onReviewPress={handleReviewPress}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: theme.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.surface,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: theme.background,
  },
  searchBarContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
  },
  searchBarInput: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBarText: {
    fontSize: 15,
    color: theme.text,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: theme.surface,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.text,
  },
  statLabel: {
    fontSize: 11,
    color: theme.textLight,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.cream,
  },
  listContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
});

export default ReviewsScreen;
