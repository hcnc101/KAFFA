import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from "react-native";
import { Text, Card, Button, Icon, Image, Divider } from "@rneui/themed";

const SCREEN_WIDTH = Dimensions.get("window").width;

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Featured Coffee of the Day */}
      <Card containerStyle={styles.featuredCard}>
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          }}
          style={styles.featuredImage}
          imageStyle={{ borderRadius: 10 }}
        >
          <View style={styles.featuredOverlay}>
            <Text style={styles.featuredLabel}>COFFEE OF THE DAY</Text>
            <Text h3 style={styles.featuredTitle}>
              Ethiopian Yirgacheffe
            </Text>
            <Text style={styles.featuredSubtitle}>
              Light Roast • Floral • Citrus
            </Text>
            <Button
              title="View Details"
              buttonStyle={styles.featuredButton}
              titleStyle={styles.featuredButtonText}
            />
          </View>
        </ImageBackground>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text h4>238</Text>
          <Text>Reviews Today</Text>
        </View>
        <View style={styles.statItem}>
          <Text h4>12</Text>
          <Text>New Roasters</Text>
        </View>
        <View style={styles.statItem}>
          <Text h4>892</Text>
          <Text>Active Users</Text>
        </View>
      </View>

      {/* Trending Coffees */}
      <Text h4 style={styles.sectionTitle}>
        Trending Coffees
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.trendingContainer}
      >
        {[1, 2, 3].map((item) => (
          <Card key={item} containerStyle={styles.trendingCard}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
              }}
              style={styles.trendingImage}
            />
            <Text style={styles.trendingTitle}>Blue Mountain</Text>
            <Text style={styles.trendingSubtitle}>Jamaica</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" type="material" color="#FFD700" size={16} />
              <Text style={styles.ratingText}>4.8 (234 reviews)</Text>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Recent Reviews */}
      <Text h4 style={styles.sectionTitle}>
        Recent Reviews
      </Text>
      <Card containerStyle={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewUser}>
            <Icon
              name="account-circle"
              type="material"
              size={40}
              color="#6F4E37"
            />
            <View style={styles.reviewUserInfo}>
              <Text style={styles.reviewUsername}>CoffeeLover123</Text>
              <Text style={styles.reviewTime}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            <Icon name="star" type="material" color="#FFD700" size={16} />
            <Text style={styles.ratingText}>4.5</Text>
          </View>
        </View>
        <Text style={styles.reviewTitle}>Colombian Dark Roast</Text>
        <Text style={styles.reviewText}>
          Rich and full-bodied with chocolate notes and a smooth finish. Perfect
          morning brew!
        </Text>
        <View style={styles.reviewActions}>
          <Button
            icon={
              <Icon name="thumb-up" type="material" color="#6F4E37" size={16} />
            }
            type="clear"
            titleStyle={styles.actionButtonText}
            title=" 24"
          />
          <Button
            icon={
              <Icon name="comment" type="material" color="#6F4E37" size={16} />
            }
            type="clear"
            titleStyle={styles.actionButtonText}
            title=" 8"
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  featuredCard: {
    padding: 0,
    margin: 0,
    marginBottom: 15,
    borderWidth: 0,
  },
  featuredImage: {
    height: 300,
    justifyContent: "flex-end",
  },
  featuredOverlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  featuredLabel: {
    color: "#FFD700",
    fontWeight: "bold",
    marginBottom: 5,
  },
  featuredTitle: {
    color: "white",
    marginBottom: 5,
  },
  featuredSubtitle: {
    color: "white",
    marginBottom: 15,
  },
  featuredButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingHorizontal: 30,
  },
  featuredButtonText: {
    color: "#000",
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    backgroundColor: "white",
    marginBottom: 15,
  },
  statItem: {
    alignItems: "center",
  },
  sectionTitle: {
    marginLeft: 15,
    marginBottom: 10,
    color: "#6F4E37",
  },
  trendingContainer: {
    paddingLeft: 5,
    marginBottom: 15,
  },
  trendingCard: {
    width: SCREEN_WIDTH * 0.4,
    margin: 5,
    padding: 0,
    borderRadius: 10,
  },
  trendingImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginHorizontal: 10,
  },
  trendingSubtitle: {
    color: "#666",
    fontSize: 14,
    marginHorizontal: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  ratingText: {
    marginLeft: 5,
    color: "#666",
  },
  reviewCard: {
    borderRadius: 10,
    padding: 15,
    margin: 15,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewUser: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewUserInfo: {
    marginLeft: 10,
  },
  reviewUsername: {
    fontWeight: "bold",
    fontSize: 16,
  },
  reviewTime: {
    color: "#666",
    fontSize: 12,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  reviewText: {
    color: "#444",
    marginBottom: 10,
  },
  reviewActions: {
    flexDirection: "row",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  actionButtonText: {
    color: "#6F4E37",
    fontSize: 14,
  },
});

export default HomeScreen;
