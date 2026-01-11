import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  DeviceEventEmitter,
} from "react-native";
import { Text, Icon } from "@rneui/themed";
import { useFocusEffect } from "@react-navigation/native";
import {
  getCoffeeEntriesSorted,
  loadCoffeeEntries,
  CoffeeEntry,
} from "../data/coffeeEntries";
import { getAllReviews, loadReviews } from "../data/reviews";
import { Review } from "../types/review";
import ReviewsList from "../components/ReviewsList";

// Theme - matching the app's coffee aesthetic
const theme = {
  primary: "#8B4513",
  secondary: "#C4A484",
  background: "#FAF8F5",
  surface: "#FFFFFF",
  accent: "#D4AF37",
  text: "#2C1810",
  textLight: "#6B5344",
  caffeine: "#FF6B35",
  cream: "#F5E6D3",
};

const ActivityScreen = () => {
  const [activeTab, setActiveTab] = useState<"log" | "reviews">("log");
  const [refreshing, setRefreshing] = useState(false);
  const [coffeeEntries, setCoffeeEntries] = useState<CoffeeEntry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const refreshCoffeeEntries = async () => {
    await loadCoffeeEntries();
    const entries = getCoffeeEntriesSorted();
    setCoffeeEntries(entries);
  };

  const refreshReviews = async () => {
    await loadReviews();
    const allReviews = getAllReviews();
    const sortedReviews = [...allReviews].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
    setReviews(sortedReviews);
  };

  const refreshAll = async () => {
    await refreshCoffeeEntries();
    await refreshReviews();
  };

  useEffect(() => {
    refreshAll();

    const coffeeSubscription = DeviceEventEmitter.addListener(
      "coffeeEntryAdded",
      () => refreshCoffeeEntries()
    );

    const reviewSubscription = DeviceEventEmitter.addListener(
      "reviewAdded",
      () => refreshReviews()
    );

    return () => {
      coffeeSubscription.remove();
      reviewSubscription.remove();
    };
  }, []);

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
    const timeOnly = entry.timestamp.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View key={entry.id} style={styles.entryCard}>
        <View style={styles.entryIconContainer}>
          <Icon name="local-cafe" type="material" color={theme.surface} size={22} />
        </View>
        <View style={styles.entryContent}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>{entry.type}</Text>
            {entry.milkType && entry.milkType !== "No Milk" && (
              <View style={styles.milkBadge}>
                <Text style={styles.milkBadgeText}>{entry.milkType}</Text>
              </View>
            )}
          </View>
          <View style={styles.entryMeta}>
            <Text style={styles.entryMetaText}>{entry.volume}mL</Text>
            <View style={styles.metaDot} />
            <Text style={styles.entryMetaText}>{timeOnly}</Text>
            <View style={styles.metaDot} />
            <Text style={styles.entryMetaLight}>{timeStr}</Text>
          </View>
        </View>
        <View style={styles.caffeineBadge}>
          <Icon name="flash-on" type="material" size={12} color={theme.caffeine} />
          <Text style={styles.caffeineText}>{Math.round(entry.effectiveCaffeine)}mg</Text>
        </View>
      </View>
    );
  };

  const EmptyState = ({ type }: { type: "log" | "reviews" }) => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon
          name={type === "log" ? "coffee-outline" : "star-outline"}
          type="material-community"
          size={40}
          color={theme.secondary}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {type === "log" ? "No Coffee Logged" : "No Reviews Yet"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {type === "log"
          ? "Your coffee journey starts here"
          : "Rate your coffee experiences"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="favorite" type="material" size={24} color={theme.surface} />
          <Text style={styles.headerTitle}>Favorites</Text>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "log" && styles.tabActive]}
          onPress={() => setActiveTab("log")}
        >
          <Icon 
            name="local-cafe" 
            type="material" 
            size={18} 
            color={activeTab === "log" ? theme.primary : theme.textLight} 
          />
          <Text style={[styles.tabText, activeTab === "log" && styles.tabTextActive]}>
            Coffee Log
          </Text>
          <View style={[styles.tabCount, activeTab === "log" && styles.tabCountActive]}>
            <Text style={[styles.tabCountText, activeTab === "log" && styles.tabCountTextActive]}>
              {coffeeEntries.length}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "reviews" && styles.tabActive]}
          onPress={() => setActiveTab("reviews")}
        >
          <Icon 
            name="star" 
            type="material" 
            size={18} 
            color={activeTab === "reviews" ? theme.primary : theme.textLight} 
          />
          <Text style={[styles.tabText, activeTab === "reviews" && styles.tabTextActive]}>
            Reviews
          </Text>
          <View style={[styles.tabCount, activeTab === "reviews" && styles.tabCountActive]}>
            <Text style={[styles.tabCountText, activeTab === "reviews" && styles.tabCountTextActive]}>
              {reviews.length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content - conditionally render either Coffee Log or Reviews */}
      {activeTab === "log" ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {coffeeEntries.length === 0 ? (
            <EmptyState type="log" />
          ) : (
            coffeeEntries.map(renderCoffeeEntry)
          )}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      ) : (
        <View style={styles.reviewsListContainer}>
          <ReviewsList
            reviews={reviews}
            onReviewPress={() => {}}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </View>
      )}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.surface,
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: theme.surface,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  tabActive: {
    backgroundColor: theme.cream,
    borderWidth: 1.5,
    borderColor: theme.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.textLight,
  },
  tabTextActive: {
    color: theme.primary,
  },
  tabCount: {
    backgroundColor: theme.cream,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabCountActive: {
    backgroundColor: theme.primary,
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: "bold",
    color: theme.textLight,
  },
  tabCountTextActive: {
    color: theme.surface,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  entryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  entryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  entryContent: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.text,
  },
  milkBadge: {
    backgroundColor: theme.cream,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  milkBadgeText: {
    fontSize: 11,
    color: theme.primary,
    fontWeight: "500",
  },
  entryMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  entryMetaText: {
    fontSize: 13,
    color: theme.textLight,
    fontWeight: "500",
  },
  entryMetaLight: {
    fontSize: 12,
    color: theme.secondary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.secondary,
    marginHorizontal: 6,
  },
  caffeineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.caffeine}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  caffeineText: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.caffeine,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.cream,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.textLight,
    textAlign: "center",
  },
  bottomSpacing: {
    height: 30,
  },
  reviewsListContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
});

export default ActivityScreen;
