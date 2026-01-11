import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  DeviceEventEmitter,
} from "react-native";
import { Text, Icon, Tab, TabView } from "@rneui/themed";
import { useFocusEffect } from "@react-navigation/native";
import {
  getAllCoffeeEntries,
  getCoffeeEntriesSorted,
  loadCoffeeEntries,
  CoffeeEntry,
} from "../data/coffeeEntries";
import { getAllReviews, loadReviews } from "../data/reviews";
import { Review } from "../types/review";

const theme = {
  primary: "#8B4513",
  secondary: "#C4A484",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#333333",
  textLight: "#666666",
};

const ActivityScreen = () => {
  const [index, setIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [coffeeEntries, setCoffeeEntries] = useState<CoffeeEntry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const refreshCoffeeEntries = async () => {
    await loadCoffeeEntries();
    const entries = getCoffeeEntriesSorted();
    console.log("ActivityScreen: Loaded", entries.length, "coffee entries");
    setCoffeeEntries(entries);
  };

  const refreshReviews = async () => {
    await loadReviews();
    const allReviews = getAllReviews();
    // Sort by date, newest first
    const sortedReviews = [...allReviews].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
    console.log("ActivityScreen: Loaded", sortedReviews.length, "reviews");
    setReviews(sortedReviews);
  };

  const refreshAll = async () => {
    await refreshCoffeeEntries();
    await refreshReviews();
  };

  // Load data when component mounts
  useEffect(() => {
    refreshAll();

    // Listen for new coffee entries
    const coffeeSubscription = DeviceEventEmitter.addListener(
      "coffeeEntryAdded",
      () => {
        console.log(
          "ActivityScreen: Received coffeeEntryAdded event, refreshing..."
        );
        refreshCoffeeEntries();
      }
    );

    // Listen for new reviews
    const reviewSubscription = DeviceEventEmitter.addListener(
      "reviewAdded",
      () => {
        console.log(
          "ActivityScreen: Received reviewAdded event, refreshing..."
        );
        refreshReviews();
      }
    );

    return () => {
      coffeeSubscription.remove();
      reviewSubscription.remove();
    };
  }, []);

  // Refresh when this tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshAll();
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderCoffeeEntry = (entry: CoffeeEntry) => {
    const timeStr = formatTime(entry.timestamp);
    const dateStr = entry.timestamp.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeOnly = entry.timestamp.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity key={entry.id} style={styles.coffeeEntryItem}>
        <View style={styles.coffeeEntryLeft}>
          <View style={styles.coffeeIconContainer}>
            <Icon name="local-cafe" color="#6F4E37" size={32} />
          </View>
          <View style={styles.coffeeEntryContent}>
            <View style={styles.coffeeEntryHeader}>
              <Text style={styles.coffeeType}>{entry.type}</Text>
              {entry.milkType && entry.milkType !== "No Milk" && (
                <Text style={styles.milkType}> • {entry.milkType}</Text>
              )}
            </View>
            <View style={styles.coffeeDetails}>
              <Text style={styles.coffeeDetail}>
                {entry.volume}mL • {entry.caffeine}mg caffeine
              </Text>
              {entry.effectiveCaffeine !== entry.caffeine && (
                <Text style={styles.effectiveCaffeine}>
                  ({Math.round(entry.effectiveCaffeine)}mg effective)
                </Text>
              )}
            </View>
            <View style={styles.coffeeTimeRow}>
              <Text style={styles.coffeeDate}>{dateStr}</Text>
              <Text style={styles.coffeeTime}>{timeOnly}</Text>
              <Text style={styles.coffeeTimeAgo}> • {timeStr}</Text>
            </View>
          </View>
        </View>
        <View style={styles.coffeeEntryRight}>
          <Text style={styles.caffeineBadge}>
            {Math.round(entry.effectiveCaffeine)}mg
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderReview = (review: Review) => {
    const timeStr = formatTime(review.date);
    const dateStr = review.date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return (
      <TouchableOpacity key={review.id} style={styles.reviewItem}>
        <View style={styles.reviewLeft}>
          <View style={styles.reviewIconContainer}>
            <Icon name="rate-review" color="#6F4E37" size={32} />
          </View>
          <View style={styles.reviewContent}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewCoffeeName}>{review.coffeeName}</Text>
              <Text style={styles.reviewScore}>{review.rating}/100</Text>
            </View>
            <Text style={styles.reviewRoaster}>
              {review.roaster} • {review.origin}
            </Text>
            {review.notes && (
              <Text style={styles.reviewNotes} numberOfLines={2}>
                {review.notes}
              </Text>
            )}
            <View style={styles.reviewTimeRow}>
              <Text style={styles.reviewDate}>{dateStr}</Text>
              <Text style={styles.reviewTimeAgo}> • {timeStr}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Tab
        value={index}
        onChange={setIndex}
        indicatorStyle={styles.tabIndicator}
        variant="primary"
      >
        <Tab.Item
          title="Coffee Log"
          titleStyle={styles.tabTitle}
          containerStyle={styles.tabContainer}
        />
        <Tab.Item
          title="Reviews"
          titleStyle={styles.tabTitle}
          containerStyle={styles.tabContainer}
        />
      </Tab>

      <TabView value={index} onChange={setIndex} animationType="spring">
        <TabView.Item style={styles.tabViewItem}>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {coffeeEntries.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon
                  name="coffee-outline"
                  type="material-community"
                  size={64}
                  color="#d3d3d3"
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No Coffee Logged Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start logging your coffees on the Home tab!
                </Text>
              </View>
            ) : (
              coffeeEntries.map(renderCoffeeEntry)
            )}
          </ScrollView>
        </TabView.Item>

        <TabView.Item style={styles.tabViewItem}>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {reviews.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon
                  name="rate-review"
                  type="material"
                  size={64}
                  color="#d3d3d3"
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No Reviews Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start adding coffee reviews!
                </Text>
              </View>
            ) : (
              reviews.map(renderReview)
            )}
          </ScrollView>
        </TabView.Item>
      </TabView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  tabContainer: {
    backgroundColor: theme.background,
  },
  tabIndicator: {
    backgroundColor: theme.primary,
    height: 3,
  },
  tabTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "bold",
  },
  tabViewItem: {
    width: "100%",
  },
  // Coffee entry styles
  coffeeEntryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FAFAFA",
  },
  coffeeEntryLeft: {
    flex: 1,
    flexDirection: "row",
  },
  coffeeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#6F4E37",
  },
  coffeeEntryContent: {
    flex: 1,
  },
  coffeeEntryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  coffeeType: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.text,
  },
  milkType: {
    fontSize: 14,
    color: theme.textLight,
    fontStyle: "italic",
  },
  coffeeDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  coffeeDetail: {
    fontSize: 13,
    color: theme.textLight,
    marginRight: 8,
  },
  effectiveCaffeine: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "500",
  },
  coffeeTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  coffeeDate: {
    fontSize: 12,
    color: theme.textLight,
    marginRight: 4,
  },
  coffeeTime: {
    fontSize: 12,
    color: theme.textLight,
    fontWeight: "500",
  },
  coffeeTimeAgo: {
    fontSize: 11,
    color: theme.textLight,
    fontStyle: "italic",
  },
  coffeeEntryRight: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 12,
  },
  caffeineBadge: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6B35",
    backgroundColor: "#FFF8F0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF6B35",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.textLight,
    textAlign: "center",
  },
  // Review styles
  reviewItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FAFAFA",
  },
  reviewLeft: {
    flex: 1,
    flexDirection: "row",
  },
  reviewIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#6F4E37",
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewCoffeeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.text,
    flex: 1,
  },
  reviewScore: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6F4E37",
    marginLeft: 8,
  },
  reviewRoaster: {
    fontSize: 13,
    color: theme.textLight,
    marginBottom: 4,
  },
  reviewNotes: {
    fontSize: 13,
    color: theme.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  reviewTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: theme.textLight,
  },
  reviewTimeAgo: {
    fontSize: 11,
    color: theme.textLight,
    fontStyle: "italic",
  },
});

export default ActivityScreen;
