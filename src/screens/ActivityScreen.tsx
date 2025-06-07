import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, Avatar, Icon, Divider } from "@rneui/themed";

const theme = {
  primary: "#8B4513",
  secondary: "#C4A484",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#333333",
  textLight: "#666666",
};

const ActivityScreen = () => {
  const activities = [
    {
      type: "like",
      user: "Sarah Chen",
      action: "liked your review of Ethiopian Yirgacheffe",
      time: "2m ago",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    {
      type: "follow",
      user: "Mike Johnson",
      action: "started following you",
      time: "15m ago",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      type: "comment",
      user: "Emma Wilson",
      action: "commented on your Colombian Dark Roast review",
      time: "1h ago",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      type: "mention",
      user: "James Brown",
      action: "mentioned you in a review",
      time: "2h ago",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "like":
        return { name: "favorite", color: "#E91E63" };
      case "follow":
        return { name: "person-add", color: "#2196F3" };
      case "comment":
        return { name: "chat-bubble", color: "#4CAF50" };
      case "mention":
        return { name: "alternate-email", color: "#FF9800" };
      default:
        return { name: "notifications", color: theme.primary };
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text h4 style={styles.headerTitle}>
          Activity
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today</Text>
        {activities.map((activity, index) => (
          <React.Fragment key={index}>
            <View style={styles.activityItem}>
              <Avatar
                size={50}
                rounded
                source={{ uri: activity.avatar }}
                containerStyle={styles.avatar}
              />
              <View style={styles.activityContent}>
                <View style={styles.activityHeader}>
                  <Text style={styles.username}>{activity.user}</Text>
                  <Text style={styles.time}>{activity.time}</Text>
                </View>
                <Text style={styles.action}>{activity.action}</Text>
              </View>
              <Icon
                name={getActivityIcon(activity.type).name}
                type="material"
                color={getActivityIcon(activity.type).color}
                size={24}
              />
            </View>
            {index < activities.length - 1 && (
              <Divider style={styles.divider} />
            )}
          </React.Fragment>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.activityItem}>
          <Avatar
            size={50}
            rounded
            source={{ uri: "https://randomuser.me/api/portraits/men/3.jpg" }}
            containerStyle={styles.avatar}
          />
          <View style={styles.activityContent}>
            <View style={styles.activityHeader}>
              <Text style={styles.username}>David Lee</Text>
              <Text style={styles.time}>2d ago</Text>
            </View>
            <Text style={styles.action}>liked your profile</Text>
          </View>
          <Icon name="favorite" type="material" color="#E91E63" size={24} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    padding: 15,
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    color: theme.text,
    fontSize: 24,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.textLight,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  avatar: {
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
    color: theme.text,
  },
  action: {
    color: theme.textLight,
    fontSize: 14,
  },
  time: {
    color: theme.textLight,
    fontSize: 12,
  },
  divider: {
    marginLeft: 80,
  },
});

export default ActivityScreen;
