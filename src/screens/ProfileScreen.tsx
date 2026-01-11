import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Text, Icon, Card } from "@rneui/themed";
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Circle, Path, G, Defs, LinearGradient, Stop } from "react-native-svg";
import ReviewsList from "../components/ReviewsList";
import { getAllReviews, loadReviews } from "../data/reviews";
import { Review } from "../types/review";
import { loadCoffeeEntries, getCoffeeEntriesSorted } from "../data/coffeeEntries";

const SCREEN_WIDTH = Dimensions.get("window").width;

// Theme - matching HomeScreen's coffee aesthetic
const theme = {
  primary: "#8B4513",
  secondary: "#C4A484",
  background: "#FAF8F5",
  surface: "#FFFFFF",
  accent: "#D4AF37",
  text: "#2C1810",
  textLight: "#6B5344",
  caffeine: "#FF6B35",
  espresso: "#3C2415",
  cream: "#F5E6D3",
};

interface CoffeeEntry {
  id: string;
  type: string;
  volume: number;
  caffeine: number;
  timestamp: Date;
  effectiveCaffeine: number;
  milkType?: string;
}

interface CoffeeStats {
  totalCups: number;
  totalCaffeine: number;
  avgCaffeinePerDay: number;
  favoriteCoffee: string;
  favoriteCount: number;
  daysTracked: number;
  weeklyAvg: number;
  currentStreak: number;
}

const ProfileScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coffeeEntries, setCoffeeEntries] = useState<CoffeeEntry[]>([]);
  const [stats, setStats] = useState<CoffeeStats>({
    totalCups: 0,
    totalCaffeine: 0,
    avgCaffeinePerDay: 0,
    favoriteCoffee: "-",
    favoriteCount: 0,
    daysTracked: 0,
    weeklyAvg: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    refreshData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [])
  );

  const refreshData = async () => {
    await loadReviews();
    await loadCoffeeEntries();
    
    const allReviews = getAllReviews();
    const allEntries = getCoffeeEntriesSorted();
    
    setReviews(allReviews);
    setCoffeeEntries(allEntries);
    calculateStats(allEntries);
  };

  const calculateStats = (entries: CoffeeEntry[]) => {
    if (entries.length === 0) {
      setStats({
        totalCups: 0,
        totalCaffeine: 0,
        avgCaffeinePerDay: 0,
        favoriteCoffee: "-",
        favoriteCount: 0,
        daysTracked: 0,
        weeklyAvg: 0,
        currentStreak: 0,
      });
      return;
    }

    // Total caffeine
    const totalCaffeine = entries.reduce((sum, e) => sum + (e.effectiveCaffeine || e.caffeine), 0);

    // Days tracked (unique days)
    const uniqueDays = new Set(entries.map(e => {
      const date = new Date(e.timestamp);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }));
    const daysTracked = uniqueDays.size;

    // Favorite coffee
    const coffeeCount: Record<string, number> = {};
    entries.forEach(e => {
      coffeeCount[e.type] = (coffeeCount[e.type] || 0) + 1;
    });
    const favoriteCoffee = Object.entries(coffeeCount).sort((a, b) => b[1] - a[1])[0];

    // Weekly average (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyEntries = entries.filter(e => new Date(e.timestamp) >= oneWeekAgo);
    const weeklyAvg = weeklyEntries.length / 7;

    // Current streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i <= 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
      
      if (uniqueDays.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    setStats({
      totalCups: entries.length,
      totalCaffeine: Math.round(totalCaffeine),
      avgCaffeinePerDay: daysTracked > 0 ? Math.round(totalCaffeine / daysTracked) : 0,
      favoriteCoffee: favoriteCoffee ? favoriteCoffee[0] : "-",
      favoriteCount: favoriteCoffee ? favoriteCoffee[1] : 0,
      daysTracked,
      weeklyAvg: Math.round(weeklyAvg * 10) / 10,
      currentStreak: streak,
    });
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, []);

  // Mini donut chart for caffeine consumption
  const CaffeineDonut = ({ percentage }: { percentage: number }) => {
    const size = 100;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.caffeine} />
            <Stop offset="100%" stopColor={theme.primary} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.cream}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#donutGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    );
  };

  const renderJourneyHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerIcon}>
          <Icon name="coffee" type="material-community" size={40} color={theme.surface} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Your Coffee Journey</Text>
          <Text style={styles.headerSubtitle}>
            {stats.daysTracked > 0 
              ? `Tracking for ${stats.daysTracked} day${stats.daysTracked > 1 ? 's' : ''}`
              : 'Start logging your coffee!'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      <View style={styles.quickStatCard}>
        <Icon name="local-cafe" type="material" size={24} color={theme.primary} />
        <Text style={styles.quickStatNumber}>{stats.totalCups}</Text>
        <Text style={styles.quickStatLabel}>Total Cups</Text>
      </View>
      <View style={styles.quickStatCard}>
        <Icon name="flash-on" type="material" size={24} color={theme.caffeine} />
        <Text style={styles.quickStatNumber}>{(stats.totalCaffeine / 1000).toFixed(1)}g</Text>
        <Text style={styles.quickStatLabel}>Total Caffeine</Text>
      </View>
      <View style={styles.quickStatCard}>
        <Icon name="whatshot" type="material" size={24} color={theme.accent} />
        <Text style={styles.quickStatNumber}>{stats.currentStreak}</Text>
        <Text style={styles.quickStatLabel}>Day Streak</Text>
      </View>
    </View>
  );

  const renderFavoriteCard = () => (
    <Card containerStyle={styles.favoriteCard}>
      <View style={styles.favoriteHeader}>
        <Icon name="favorite" type="material" size={20} color={theme.primary} />
        <Text style={styles.favoriteTitle}>Your Favorite</Text>
      </View>
      <View style={styles.favoriteContent}>
        <View style={styles.favoriteCoffeeIcon}>
          <Icon name="coffee" type="material-community" size={32} color={theme.surface} />
        </View>
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteCoffeeName}>{stats.favoriteCoffee}</Text>
          <Text style={styles.favoriteCoffeeCount}>
            {stats.favoriteCount > 0 
              ? `Ordered ${stats.favoriteCount} time${stats.favoriteCount > 1 ? 's' : ''}`
              : 'No coffee logged yet'}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderDailyInsights = () => {
    const dailyLimit = 400; // FDA recommended max
    const percentage = Math.min((stats.avgCaffeinePerDay / dailyLimit) * 100, 100);
    
    return (
      <Card containerStyle={styles.insightsCard}>
        <Text style={styles.insightsTitle}>Daily Caffeine Insights</Text>
        <View style={styles.insightsContent}>
          <View style={styles.donutContainer}>
            <CaffeineDonut percentage={percentage} />
            <View style={styles.donutCenter}>
              <Text style={styles.donutValue}>{stats.avgCaffeinePerDay}</Text>
              <Text style={styles.donutUnit}>mg/day</Text>
            </View>
          </View>
          <View style={styles.insightsInfo}>
            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Daily Average</Text>
              <Text style={styles.insightValue}>{stats.avgCaffeinePerDay}mg</Text>
            </View>
            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Recommended Max</Text>
              <Text style={styles.insightValue}>400mg</Text>
            </View>
            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Weekly Avg Cups</Text>
              <Text style={styles.insightValue}>{stats.weeklyAvg}</Text>
            </View>
            <View style={[styles.statusBadge, percentage > 80 ? styles.statusWarning : styles.statusGood]}>
              <Icon 
                name={percentage > 80 ? "warning" : "check-circle"} 
                type="material" 
                size={14} 
                color={percentage > 80 ? "#FF8C00" : "#2E7D32"} 
              />
              <Text style={[styles.statusText, percentage > 80 ? styles.statusTextWarning : styles.statusTextGood]}>
                {percentage > 80 ? "High caffeine intake" : "Healthy intake level"}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const renderReviewsSection = () => (
    <View style={styles.reviewsSection}>
      <View style={styles.reviewsHeader}>
        <Icon name="rate-review" type="material" size={24} color={theme.primary} />
        <Text style={styles.reviewsTitle}>Your Reviews</Text>
        <View style={styles.reviewsCount}>
          <Text style={styles.reviewsCountText}>{reviews.length}</Text>
        </View>
      </View>
      {reviews.length > 0 ? (
        <ReviewsList
          reviews={reviews}
          onReviewPress={() => {}}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      ) : (
        <View style={styles.emptyReviews}>
          <Icon name="coffee-outline" type="material-community" size={48} color={theme.secondary} />
          <Text style={styles.emptyReviewsText}>No reviews yet</Text>
          <Text style={styles.emptyReviewsSubtext}>Rate your coffee experiences to see them here</Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      {renderJourneyHeader()}
      {renderQuickStats()}
      {renderFavoriteCard()}
      {renderDailyInsights()}
      {renderReviewsSection()}
      <View style={styles.bottomSpacing} />
    </ScrollView>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: theme.surface,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  quickStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: -20,
  },
  quickStatCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickStatNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.text,
    marginTop: 8,
  },
  quickStatLabel: {
    fontSize: 11,
    color: theme.textLight,
    marginTop: 4,
    textAlign: "center",
  },
  favoriteCard: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: theme.surface,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  favoriteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  favoriteTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.textLight,
    marginLeft: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  favoriteContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteCoffeeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteCoffeeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.text,
  },
  favoriteCoffeeCount: {
    fontSize: 14,
    color: theme.textLight,
    marginTop: 2,
  },
  insightsCard: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: theme.surface,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 16,
  },
  insightsContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  donutContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  donutCenter: {
    position: "absolute",
    alignItems: "center",
  },
  donutValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.text,
  },
  donutUnit: {
    fontSize: 10,
    color: theme.textLight,
  },
  insightsInfo: {
    flex: 1,
    marginLeft: 20,
  },
  insightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  insightLabel: {
    fontSize: 13,
    color: theme.textLight,
  },
  insightValue: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.text,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  statusGood: {
    backgroundColor: "rgba(46, 125, 50, 0.1)",
  },
  statusWarning: {
    backgroundColor: "rgba(255, 140, 0, 0.1)",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  statusTextGood: {
    color: "#2E7D32",
  },
  statusTextWarning: {
    color: "#FF8C00",
  },
  reviewsSection: {
    marginTop: 24,
    flex: 1,
  },
  reviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.text,
    marginLeft: 10,
    flex: 1,
  },
  reviewsCount: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  reviewsCountText: {
    color: theme.surface,
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyReviews: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
  emptyReviewsText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginTop: 12,
  },
  emptyReviewsSubtext: {
    fontSize: 14,
    color: theme.textLight,
    textAlign: "center",
    marginTop: 4,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default ProfileScreen;
