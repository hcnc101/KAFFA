import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type CoffeeShopCardProps = {
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  description: string;
  image: any;
  onPress?: () => void;
  onBookmark?: () => void;
  bookmarked?: boolean;
};

export const CoffeeShopCard: React.FC<CoffeeShopCardProps> = ({
  name,
  address,
  rating,
  reviewCount,
  description,
  image,
  onPress,
  onBookmark,
  bookmarked,
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
    <Image source={image} style={styles.image} />
    <TouchableOpacity style={styles.bookmark} onPress={onBookmark}>
      <Ionicons
        name={bookmarked ? "bookmark" : "bookmark-outline"}
        size={24}
        color="#8B4513"
      />
    </TouchableOpacity>
    <View style={styles.info}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.address}>{address}</Text>
      <View style={styles.ratingRow}>
        <Ionicons name="star" size={18} color="#D4AF37" />
        <Text style={styles.rating}>{rating.toFixed(1)}</Text>
        <Text style={styles.reviewCount}>({reviewCount} reviews)</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginVertical: 10,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 160,
  },
  bookmark: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    elevation: 2,
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
  },
  address: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  rating: {
    fontSize: 16,
    color: "#8B4513",
    marginLeft: 4,
    fontWeight: "bold",
  },
  reviewCount: {
    fontSize: 14,
    color: "#888",
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: "#333",
    marginTop: 8,
  },
});

export default CoffeeShopCard;
