import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Text, Icon } from "@rneui/themed";
import ReviewCard from "./ReviewCard";
import { Review } from "../types/review";

// Theme - matching the app's coffee aesthetic
const theme = {
  primary: "#8B4513",
  secondary: "#C4A484",
  background: "#FAF8F5",
  surface: "#FFFFFF",
  text: "#2C1810",
  textLight: "#6B5344",
  cream: "#F5E6D3",
};

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
      <View style={styles.emptyIconContainer}>
        <Icon
          name="coffee-outline"
          type="material-community"
          size={48}
          color={theme.secondary}
        />
      </View>
      <Text style={styles.emptyTitle}>No Reviews Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first coffee review to start building your tasting journal
      </Text>
    </View>
  );

  return (
    <FlatList
      data={reviews}
      renderItem={renderReview}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.container,
        reviews.length === 0 && styles.emptyListContainer
      ]}
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
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.cream,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.textLight,
    textAlign: "center",
    lineHeight: 22,
  },
});

export default ReviewsList;
