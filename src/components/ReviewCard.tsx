import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card, Icon, AirbnbRating } from "@rneui/themed";
import { Review } from "../types/review";
import RadarChart from "./RadarChart";

interface ReviewCardProps {
  review: Review;
  onPress?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onPress }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const CardContent = () => (
    <Card containerStyle={styles.card}>
      <View style={styles.header}>
        <View style={styles.coffeeInfo}>
          <Text style={styles.coffeeName}>{review.coffeeName}</Text>
          <Text style={styles.roaster}>{review.roaster}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <AirbnbRating
            count={5}
            defaultRating={review.rating}
            size={16}
            showRating={false}
            selectedColor="#6F4E37"
            isDisabled
          />
          <Text style={styles.ratingText}>{review.rating}/5</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Icon name="public" type="material" size={16} color="#86939e" />
          <Text style={styles.detailText}>{review.origin}</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="schedule" type="material" size={16} color="#86939e" />
          <Text style={styles.detailText}>{formatDate(review.date)}</Text>
        </View>
      </View>

      {review.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Tasting Notes:</Text>
          <Text style={styles.notesText}>{review.notes}</Text>
        </View>
      )}

      {/* Flavor Profile Chart */}
      {review.flavour &&
        review.aroma &&
        review.body &&
        review.acidity &&
        review.strength && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartLabel}>Flavor Profile:</Text>
            <RadarChart
              values={[
                review.flavour,
                review.aroma,
                review.body,
                review.acidity,
                review.strength,
              ]}
              labels={["Flavour", "Aroma", "Body", "Acidity", "Strength"]}
              max={5}
              size={300}
              caption={`${review.milkType} • Overall: ${review.overall}/5`}
            />
          </View>
        )}

      {review.tags && review.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {review.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  coffeeInfo: {
    flex: 1,
    marginRight: 12,
  },
  coffeeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  roaster: {
    fontSize: 14,
    color: "#6F4E37",
    fontWeight: "500",
  },
  ratingContainer: {
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#86939e",
    marginTop: 4,
  },
  details: {
    flexDirection: "row",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  detailText: {
    fontSize: 12,
    color: "#86939e",
    marginLeft: 4,
  },
  notesContainer: {
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#666",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 12,
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  chartLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6F4E37",
    marginBottom: 2,
    letterSpacing: 0.3,
  },
});

export default ReviewCard;
