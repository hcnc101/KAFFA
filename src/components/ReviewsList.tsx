import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Text, Icon } from "@rneui/themed";
import ReviewCard from "./ReviewCard";
import { Review } from "../types/review";

interface ReviewsListProps {
  reviews: Review[];
  onReviewPress?: (review: Review) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  onReviewPress,
  refreshing = false,
  onRefresh,
}) => {
  const renderReview = ({ item }: { item: Review }) => (
    <ReviewCard review={item} onPress={() => onReviewPress?.(item)} />
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="coffee-outline"
        type="material-community"
        size={64}
        color="#d3d3d3"
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>No Reviews Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start by adding your first coffee review!
      </Text>
    </View>
  );

  return (
    <FlatList
      data={reviews}
      renderItem={renderReview}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={EmptyState}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#86939e",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

export default ReviewsList;
