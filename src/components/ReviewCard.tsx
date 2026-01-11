import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Icon } from "@rneui/themed";
import { Review } from "../types/review";
import RadarChart from "./RadarChart";

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

interface ReviewCardProps {
  review: Review;
  onPress?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onPress }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // Get score color based on rating
  const getScoreColor = (rating: number) => {
    if (rating >= 85) return "#2E7D32"; // Excellent
    if (rating >= 70) return theme.primary; // Good
    if (rating >= 50) return "#FF8C00"; // Average
    return "#C62828"; // Poor
  };

  const CardContent = () => (
    <View style={styles.card}>
      {/* Score Badge */}
      <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(review.rating) }]}>
        <Text style={styles.scoreText}>{review.rating}</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.coffeeInfo}>
          <Text style={styles.coffeeName}>{review.coffeeName}</Text>
          <View style={styles.roasterRow}>
            <Icon name="store" type="material" size={14} color={theme.primary} />
            <Text style={styles.roaster}>{review.roaster}</Text>
          </View>
        </View>
      </View>

      {/* Meta Info */}
      <View style={styles.metaContainer}>
        <View style={styles.metaItem}>
          <Icon name="public" type="material" size={14} color={theme.textLight} />
          <Text style={styles.metaText}>{review.origin}</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Icon name="schedule" type="material" size={14} color={theme.textLight} />
          <Text style={styles.metaText}>{formatDate(review.date)}</Text>
        </View>
      </View>

      {/* Tasting Notes */}
      {review.notes && (
        <View style={styles.notesContainer}>
          <View style={styles.notesHeader}>
            <Icon name="format-quote" type="material" size={16} color={theme.secondary} />
            <Text style={styles.notesLabel}>Tasting Notes</Text>
          </View>
          <Text style={styles.notesText}>{review.notes}</Text>
        </View>
      )}

      {/* Flavor Profile Chart */}
      {review.flavour !== undefined &&
        review.aroma !== undefined &&
        review.aftertaste !== undefined &&
        review.body !== undefined &&
        review.acidity !== undefined &&
        review.balance !== undefined && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Icon name="radar" type="material-community" size={16} color={theme.primary} />
              <Text style={styles.chartLabel}>Flavor Profile</Text>
            </View>
            <RadarChart
              values={[
                review.flavour,
                review.aroma,
                review.aftertaste,
                review.body,
                review.acidity,
                review.balance,
              ]}
              labels={[
                "Flavor",
                "Aroma",
                "Aftertaste",
                "Body",
                "Acidity",
                "Balance",
              ]}
              max={10}
              size={280}
              caption={`${review.milkType} • Overall: ${review.overall * 10}/100`}
            />
          </View>
        )}

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {review.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
  },
  scoreBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  header: {
    marginBottom: 12,
    paddingRight: 50,
  },
  coffeeInfo: {
    flex: 1,
  },
  coffeeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  roasterRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  roaster: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: "600",
    marginLeft: 6,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.cream,
    borderRadius: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: theme.secondary,
    marginHorizontal: 12,
  },
  metaText: {
    fontSize: 13,
    color: theme.textLight,
    marginLeft: 6,
    fontWeight: "500",
  },
  notesContainer: {
    marginBottom: 14,
    padding: 12,
    backgroundColor: theme.background,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: theme.secondary,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.textLight,
    marginLeft: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
    fontStyle: "italic",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  tag: {
    backgroundColor: theme.cream,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: "500",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: theme.background,
    borderRadius: 14,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.primary,
    marginLeft: 6,
    letterSpacing: 0.3,
  },
});

export default ReviewCard;
