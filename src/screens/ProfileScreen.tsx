import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Text, Avatar, Icon, Button, Image, Tab, TabView } from "@rneui/themed";

const SCREEN_WIDTH = Dimensions.get("window").width;

const theme = {
  primary: "#8B4513",
  secondary: "#C4A484",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#333333",
  textLight: "#666666",
};

interface Post {
  id: number;
  image: string;
  likes: number;
  comments: number;
  type: "photo" | "review";
}

const ProfileScreen = () => {
  const [index, setIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const userProfile = {
    name: "Coffee Enthusiast",
    username: "@coffeelover",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    bio: "Exploring the world one cup at a time ☕️ | Coffee Reviewer | Barista",
    location: "San Francisco, CA",
    website: "coffee.blog",
    stats: {
      posts: 42,
      followers: 1234,
      following: 567,
      reviews: 28,
    },
    badges: ["Certified Barista", "Top Reviewer", "Bean Expert"],
  };

  const posts: Post[] = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
      likes: 256,
      comments: 24,
      type: "photo",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb",
      likes: 198,
      comments: 18,
      type: "review",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1587734361993-0275024cb0b4",
      likes: 342,
      comments: 32,
      type: "photo",
    },
    // Add more posts as needed
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data fetching
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.profileInfo}>
          <Avatar
            size={80}
            rounded
            source={{ uri: userProfile.avatar }}
            containerStyle={styles.avatar}
          />
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProfile.stats.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userProfile.stats.followers}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userProfile.stats.following}
              </Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.profileDetails}>
        <Text style={styles.name}>{userProfile.name}</Text>
        <Text style={styles.username}>{userProfile.username}</Text>
        <Text style={styles.bio}>{userProfile.bio}</Text>

        <View style={styles.locationWebsite}>
          <View style={styles.infoItem}>
            <Icon
              name="location-on"
              type="material"
              size={16}
              color={theme.textLight}
            />
            <Text style={styles.infoText}>{userProfile.location}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon
              name="link"
              type="material"
              size={16}
              color={theme.textLight}
            />
            <Text style={styles.infoText}>{userProfile.website}</Text>
          </View>
        </View>

        <View style={styles.badges}>
          {userProfile.badges.map((badge, index) => (
            <View key={index} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttons}>
          <Button
            title="Edit Profile"
            buttonStyle={styles.editButton}
            titleStyle={styles.editButtonText}
            containerStyle={styles.buttonContainer}
          />
          <Button
            title="Share Profile"
            buttonStyle={styles.shareButton}
            titleStyle={styles.shareButtonText}
            containerStyle={styles.buttonContainer}
            icon={{
              name: "share",
              type: "material",
              size: 20,
              color: theme.primary,
            }}
          />
        </View>
      </View>
    </View>
  );

  const renderPost = (post: Post) => (
    <TouchableOpacity
      key={post.id}
      style={styles.post}
      onPress={() => {
        /* Navigate to post detail */
      }}
    >
      <Image
        source={{ uri: post.image }}
        style={styles.postImage}
        PlaceholderContent={<Icon name="image" size={30} color="#ccc" />}
      />
      {post.type === "review" && (
        <View style={styles.reviewBadge}>
          <Icon name="rate-review" size={16} color="white" />
        </View>
      )}
      <View style={styles.postStats}>
        <View style={styles.postStat}>
          <Icon name="favorite" size={14} color="white" />
          <Text style={styles.postStatText}>{post.likes}</Text>
        </View>
        <View style={styles.postStat}>
          <Icon name="chat-bubble" size={14} color="white" />
          <Text style={styles.postStatText}>{post.comments}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Tab
        value={index}
        onChange={setIndex}
        indicatorStyle={styles.tabIndicator}
        variant="primary"
      >
        <Tab.Item
          title="Posts"
          titleStyle={styles.tabTitle}
          icon={{ name: "grid-on", type: "material", color: theme.text }}
        />
        <Tab.Item
          title="Reviews"
          titleStyle={styles.tabTitle}
          icon={{ name: "rate-review", type: "material", color: theme.text }}
        />
      </Tab>

      <TabView value={index} onChange={setIndex} animationType="spring">
        <TabView.Item style={styles.tabViewItem}>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {renderHeader()}
            <View style={styles.postsGrid}>{posts.map(renderPost)}</View>
          </ScrollView>
        </TabView.Item>

        <TabView.Item style={styles.tabViewItem}>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {renderHeader()}
            <View style={styles.postsGrid}>
              {posts.filter((post) => post.type === "review").map(renderPost)}
            </View>
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
  header: {
    padding: 15,
  },
  headerTop: {
    marginBottom: 15,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: 20,
  },
  stats: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.text,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textLight,
    marginTop: 4,
  },
  profileDetails: {
    marginTop: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.text,
  },
  username: {
    fontSize: 14,
    color: theme.textLight,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: theme.text,
    marginBottom: 12,
  },
  locationWebsite: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.textLight,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  badge: {
    backgroundColor: theme.primary + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: "500",
  },
  buttons: {
    flexDirection: "row",
    marginTop: 15,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: theme.primary,
    borderRadius: 8,
    paddingVertical: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  shareButton: {
    backgroundColor: theme.background,
    borderRadius: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.primary,
    marginLeft: 8,
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
  postsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 1,
  },
  post: {
    width: SCREEN_WIDTH / 3 - 2,
    height: SCREEN_WIDTH / 3 - 2,
    margin: 1,
    position: "relative",
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  reviewBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: theme.primary,
    borderRadius: 12,
    padding: 4,
  },
  postStats: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  postStat: {
    flexDirection: "row",
    alignItems: "center",
  },
  postStatText: {
    color: "white",
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "500",
  },
});

export default ProfileScreen;
