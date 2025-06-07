import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Text, Avatar, Icon, Tab, TabView } from "@rneui/themed";

const theme = {
  primary: "#8B4513",
  secondary: "#C4A484",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#333333",
  textLight: "#666666",
};

interface Activity {
  id: number;
  type: "like" | "comment" | "follow" | "mention";
  user: {
    name: string;
    avatar: string;
  };
  time: string;
  content?: string;
  postImage?: string;
}

const ActivityScreen = () => {
  const [index, setIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const activities: Activity[] = [
    {
      id: 1,
      type: "like",
      user: {
        name: "Coffee Lover",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      },
      time: "2m ago",
      postImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    },
    {
      id: 2,
      type: "comment",
      user: {
        name: "Barista Pro",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      },
      time: "5m ago",
      content: "This looks amazing! What grinder did you use?",
      postImage: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb",
    },
    {
      id: 3,
      type: "follow",
      user: {
        name: "Coffee Bean",
        avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      },
      time: "15m ago",
    },
    {
      id: 4,
      type: "mention",
      user: {
        name: "Espresso Expert",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      },
      time: "1h ago",
      content: "Hey @you, check out this amazing Ethiopian blend!",
      postImage: "https://images.unsplash.com/photo-1587734361993-0275024cb0b4",
    },
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data fetching
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const renderActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "like":
        return <Icon name="favorite" color="#E91E63" size={24} />;
      case "comment":
        return <Icon name="chat-bubble" color="#2196F3" size={24} />;
      case "follow":
        return <Icon name="person-add" color="#4CAF50" size={24} />;
      case "mention":
        return <Icon name="alternate-email" color="#FF9800" size={24} />;
      default:
        return null;
    }
  };

  const renderActivityText = (activity: Activity) => {
    switch (activity.type) {
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "follow":
        return "started following you";
      case "mention":
        return "mentioned you in a comment";
      default:
        return "";
    }
  };

  const renderActivity = (activity: Activity) => (
    <TouchableOpacity key={activity.id} style={styles.activityItem}>
      <View style={styles.activityLeft}>
        <Avatar size={50} rounded source={{ uri: activity.user.avatar }} />
        <View style={styles.activityContent}>
          <View style={styles.activityHeader}>
            <Text style={styles.username}>{activity.user.name}</Text>
            <Text style={styles.activityText}>
              {renderActivityText(activity)}
            </Text>
          </View>
          {activity.content && (
            <Text style={styles.comment} numberOfLines={2}>
              {activity.content}
            </Text>
          )}
          <Text style={styles.time}>{activity.time}</Text>
        </View>
      </View>
      <View style={styles.activityRight}>
        {renderActivityIcon(activity.type)}
        {activity.postImage && (
          <Avatar
            size={50}
            source={{ uri: activity.postImage }}
            containerStyle={styles.postImage}
          />
        )}
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
          title="All Activity"
          titleStyle={styles.tabTitle}
          containerStyle={styles.tabContainer}
        />
        <Tab.Item
          title="Mentions"
          titleStyle={styles.tabTitle}
          containerStyle={styles.tabContainer}
        />
      </Tab>

      <TabView value={index} onChange={setIndex} animationType="spring">
        <TabView.Item style={styles.tabViewItem}>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {activities.map(renderActivity)}
          </ScrollView>
        </TabView.Item>

        <TabView.Item style={styles.tabViewItem}>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {activities
              .filter((activity) => activity.type === "mention")
              .map(renderActivity)}
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
  tabContainer: {
    backgroundColor: theme.background,
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
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  activityLeft: {
    flex: 1,
    flexDirection: "row",
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  username: {
    fontWeight: "bold",
    marginRight: 5,
    color: theme.text,
  },
  activityText: {
    color: theme.text,
  },
  comment: {
    marginTop: 4,
    color: theme.textLight,
  },
  time: {
    marginTop: 4,
    fontSize: 12,
    color: theme.textLight,
  },
  activityRight: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  postImage: {
    marginTop: 8,
  },
});

export default ActivityScreen;
