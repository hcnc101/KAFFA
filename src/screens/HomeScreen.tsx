import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Image as RNImage,
} from "react-native";
import {
  Text,
  Card,
  Button,
  Icon,
  Image,
  Divider,
  Avatar,
} from "@rneui/themed";

const SCREEN_WIDTH = Dimensions.get("window").width;

// Theme colors
const theme = {
  primary: "#8B4513", // Coffee brown
  secondary: "#C4A484", // Lighter brown
  background: "#FFFFFF",
  surface: "#F5F5F5",
  accent: "#D4AF37", // Gold
  text: "#333333",
  textLight: "#666666",
};

const HomeScreen = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        name: "Coffee Connoisseur",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
        location: "Blue Bottle Coffee, SF",
      },
      image:
        "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80",
      likes: 234,
      caption:
        "Starting my morning with this incredible Ethiopian Yirgacheffe. The floral notes and citrus undertones are simply perfect! ☕️✨ #MorningCoffee #Yirgacheffe #CoffeeTime",
      comments: 28,
      time: "2 hours ago",
      isLiked: false,
      isSaved: false,
      rating: 4.5,
      coffeeDetails: {
        name: "Ethiopian Yirgacheffe",
        roaster: "Blue Bottle Coffee",
        roastLevel: "Light",
        price: "$19.99",
      },
    },
    {
      id: 2,
      user: {
        name: "Barista Life",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
        location: "Home Brew",
      },
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80",
      likes: 156,
      caption:
        "Perfecting my latte art with this amazing Colombian blend. The rich chocolate notes make it perfect for milk drinks! 🥛 #LatteArt #BaristaLife #CoffeeLover",
      comments: 15,
      time: "5 hours ago",
      isLiked: true,
      isSaved: true,
      rating: 4.0,
      coffeeDetails: {
        name: "Colombian Supremo",
        roaster: "Home Roasted",
        roastLevel: "Medium",
        price: "$16.99",
      },
    },
  ]);

  const toggleLike = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      })
    );
  };

  const toggleSave = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isSaved: !post.isSaved,
          };
        }
        return post;
      })
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={
            i <= rating
              ? "star"
              : i - 0.5 <= rating
              ? "star-half"
              : "star-border"
          }
          type="material"
          color="#FFD700"
          size={16}
        />
      );
    }
    return stars;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Stories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.storiesContainer}
      >
        <View style={styles.storyItem}>
          <View style={styles.addStoryButton}>
            <Avatar
              size={60}
              rounded
              source={{
                uri: "https://randomuser.me/api/portraits/women/0.jpg",
              }}
              containerStyle={styles.storyAvatar}
            />
            <View style={styles.addButton}>
              <Icon name="add" size={20} color="white" />
            </View>
          </View>
          <Text style={styles.storyText}>Your Story</Text>
        </View>
        {["Daily Grind", "Coffee Tales", "Bean Scene", "Brew Bar"].map(
          (name, index) => (
            <View key={name} style={styles.storyItem}>
              <View style={styles.storyRing}>
                <Avatar
                  size={60}
                  rounded
                  source={{
                    uri: `https://randomuser.me/api/portraits/men/${
                      index + 1
                    }.jpg`,
                  }}
                  containerStyle={styles.storyAvatar}
                />
              </View>
              <Text style={styles.storyText}>{name}</Text>
            </View>
          )
        )}
      </ScrollView>

      {/* Posts */}
      {posts.map((post) => (
        <View key={post.id} style={styles.post}>
          {/* Post Header */}
          <View style={styles.postHeader}>
            <View style={styles.postHeaderLeft}>
              <Avatar
                size={40}
                rounded
                source={{ uri: post.user.avatar }}
                containerStyle={styles.postAvatar}
              />
              <View>
                <Text style={styles.userName}>{post.user.name}</Text>
                <Text style={styles.location}>{post.user.location}</Text>
              </View>
            </View>
            <Icon
              name="more-horiz"
              type="material"
              color={theme.text}
              size={24}
            />
          </View>

          {/* Post Image */}
          <Image
            source={{ uri: post.image }}
            style={styles.postImage}
            PlaceholderContent={<Icon name="image" size={50} color="#ccc" />}
          />

          {/* Coffee Details Card */}
          <View style={styles.coffeeDetails}>
            <Text style={styles.coffeeName}>{post.coffeeDetails.name}</Text>
            <View style={styles.coffeeInfo}>
              <Text style={styles.roasterName}>
                by {post.coffeeDetails.roaster}
              </Text>
              <View style={styles.ratingContainer}>
                {renderStars(post.rating)}
                <Text style={styles.ratingText}>{post.rating}</Text>
              </View>
            </View>
            <View style={styles.tags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  {post.coffeeDetails.roastLevel}
                </Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{post.coffeeDetails.price}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <View style={styles.leftActions}>
              <TouchableOpacity onPress={() => toggleLike(post.id)}>
                <Icon
                  name={post.isLiked ? "favorite" : "favorite-border"}
                  type="material"
                  color={post.isLiked ? "#E91E63" : theme.text}
                  size={28}
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
              <Icon
                name="chat-bubble-outline"
                type="material"
                color={theme.text}
                size={28}
                style={styles.actionIcon}
              />
              <Icon
                name="send"
                type="material"
                color={theme.text}
                size={28}
                style={styles.actionIcon}
              />
            </View>
            <TouchableOpacity onPress={() => toggleSave(post.id)}>
              <Icon
                name={post.isSaved ? "bookmark" : "bookmark-border"}
                type="material"
                color={theme.text}
                size={28}
              />
            </TouchableOpacity>
          </View>

          {/* Likes */}
          <Text style={styles.likes}>{post.likes} likes</Text>

          {/* Caption */}
          <View style={styles.captionContainer}>
            <Text style={styles.caption}>
              <Text style={styles.userName}>{post.user.name}</Text>{" "}
              {post.caption}
            </Text>
          </View>

          {/* Comments */}
          <TouchableOpacity>
            <Text style={styles.comments}>
              View all {post.comments} comments
            </Text>
          </TouchableOpacity>

          {/* Time */}
          <Text style={styles.time}>{post.time}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  storiesContainer: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#DBDBDB",
  },
  storyItem: {
    alignItems: "center",
    marginHorizontal: 8,
    width: 70,
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#E1306C",
    alignItems: "center",
    justifyContent: "center",
  },
  storyAvatar: {
    borderWidth: 2,
    borderColor: theme.background,
  },
  addStoryButton: {
    position: "relative",
  },
  addButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: theme.background,
  },
  storyText: {
    marginTop: 4,
    fontSize: 12,
    color: theme.text,
    textAlign: "center",
  },
  post: {
    marginBottom: 15,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  postHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  postAvatar: {
    marginRight: 10,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 14,
    color: theme.text,
  },
  location: {
    fontSize: 12,
    color: theme.textLight,
  },
  postImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  coffeeDetails: {
    padding: 15,
    backgroundColor: theme.surface,
    margin: 10,
    borderRadius: 12,
  },
  coffeeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 5,
  },
  coffeeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  roasterName: {
    fontSize: 14,
    color: theme.textLight,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 5,
    color: theme.text,
    fontWeight: "bold",
  },
  tags: {
    flexDirection: "row",
    marginTop: 5,
  },
  tag: {
    backgroundColor: theme.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  leftActions: {
    flexDirection: "row",
  },
  actionIcon: {
    marginRight: 15,
  },
  likes: {
    fontWeight: "bold",
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  captionContainer: {
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  caption: {
    lineHeight: 18,
  },
  comments: {
    color: theme.textLight,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  time: {
    fontSize: 12,
    color: theme.textLight,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default HomeScreen;
