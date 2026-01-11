import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeProvider } from "@rneui/themed";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Icon } from "@rneui/themed";
import { StatusBar, View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

// Import screens
import HomeScreen from "./src/screens/HomeScreen";
import SearchScreen from "./src/screens/SearchScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import AddReviewScreen from "./src/screens/AddReviewScreen";
import ActivityScreen from "./src/screens/ActivityScreen";

export type RootTabParamList = {
  Feed: undefined;
  Discover: undefined;
  Camera: undefined;
  Activity: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// Define our theme colors
const theme = {
  primary: "#8B4513", // Darker coffee brown
  secondary: "#C4A484", // Lighter brown
  background: "#FFFFFF",
  surface: "#F5F5F5",
  accent: "#D4AF37", // Gold
  text: "#333333",
  textLight: "#666666",
};

// Define styles outside the component to prevent re-creation on every render
const tabBarStyle = {
  backgroundColor: theme.background,
  borderTopColor: "#E0E0E0",
  height: 60,
  paddingBottom: 8,
  paddingTop: 8,
};

const headerStyle = {
  backgroundColor: theme.background,
  elevation: 0, // Remove shadow on Android
  shadowOpacity: 0, // Remove shadow on iOS
  borderBottomWidth: 1,
  borderBottomColor: "#E0E0E0",
};

const headerTitleStyle = {
  color: theme.primary,
  fontSize: 20,
  fontWeight: "600",
} as const;

const CoffeeBeanIcon = ({ size = 24, color = "#FFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C7 2 2 7 2 12c0 5 5 10 10 10s10-5 10-10C22 7 17 2 12 2zm0 18c-4.41 0-8-4.03-8-8 0-1.85.63-3.55 1.69-4.9l11.21 11.21C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.41 0 8 4.03 8 8 0 1.85-.63 3.55-1.69 4.9z"
      fill={color}
    />
  </Svg>
);

// Caffeine Clock Spiral Icon - matches the app's caffeine tracking feature
const CaffeineClockIcon = ({ size = 24, color = "#8B4513", focused = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Outer spiral arc */}
    <Path
      d="M12 3C7.03 3 3 7.03 3 12"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      fill="none"
    />
    {/* Middle spiral arc */}
    <Path
      d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      fill="none"
    />
    {/* Inner spiral arc */}
    <Path
      d="M12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      fill="none"
    />
    {/* Center dot */}
    <Path
      d="M12 11.5C12.28 11.5 12.5 11.72 12.5 12C12.5 12.28 12.28 12.5 12 12.5C11.72 12.5 11.5 12.28 11.5 12C11.5 11.72 11.72 11.5 12 11.5Z"
      fill={color}
    />
  </Svg>
);

// Dashboard/Stats Icon - for the coffee journey stats screen
const DashboardIcon = ({ size = 24, color = "#8B4513", focused = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Bar chart bars */}
    <Path
      d="M4 18V14"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
    />
    <Path
      d="M9 18V9"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
    />
    <Path
      d="M14 18V12"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
    />
    <Path
      d="M19 18V6"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
    />
    {/* Base line */}
    <Path
      d="M2 20H22"
      stroke={color}
      strokeWidth={focused ? 2 : 1.5}
      strokeLinecap="round"
    />
  </Svg>
);

// Diary/Journal Icon - for activity screen with coffee logs & reviews
const DiaryIcon = ({ size = 24, color = "#8B4513", focused = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Book spine */}
    <Path
      d="M4 4C4 3 5 2 6 2H18C19 2 20 3 20 4V20C20 21 19 22 18 22H6C5 22 4 21 4 20V4Z"
      stroke={color}
      strokeWidth={focused ? 2 : 1.5}
      fill="none"
    />
    {/* Book binding line */}
    <Path
      d="M7 2V22"
      stroke={color}
      strokeWidth={focused ? 2 : 1.5}
    />
    {/* Bookmark ribbon */}
    <Path
      d="M14 2V8L16 6.5L18 8V2"
      stroke={color}
      strokeWidth={focused ? 1.5 : 1}
      fill={focused ? color : "none"}
    />
  </Svg>
);

// Transform-based centered BeanHeartButton
const BeanHeartButton = () => (
  <View
    style={{
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "#8B4513",
      justifyContent: "center",
      alignItems: "center",
      marginTop: -28, // Pull it up exactly half its height
      borderWidth: 3,
      borderColor: "#FFF",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    }}
  >
    <Image
      source={require("./assets/bean-heart-logo.png")}
      style={{
        width: 30,
        height: 30,
        tintColor: "white",
        transform: [
          { translateX: 2 }, // Move right by 2px
          { translateY: 2 }, // Move down by 2px
        ],
      }}
      resizeMode="contain"
    />
  </View>
);

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <ThemeProvider>
        <NavigationContainer>
          <Tab.Navigator
            id={undefined}
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                // Custom icons for each tab
                if (route.name === "Feed") {
                  // Caffeine clock spiral icon
                  return <CaffeineClockIcon size={size} color={color} focused={focused} />;
                } else if (route.name === "Discover") {
                  const iconName = focused ? "search" : "search-outline";
                  return <Ionicons name={iconName} size={size} color={color} />;
                } else if (route.name === "Camera") {
                  return <BeanHeartButton />;
                } else if (route.name === "Activity") {
                  // Diary/journal icon for coffee logs & reviews
                  return <DiaryIcon size={size} color={color} focused={focused} />;
                } else if (route.name === "Profile") {
                  // Dashboard/stats icon for coffee journey
                  return <DashboardIcon size={size} color={color} focused={focused} />;
                }

                return null;
              },
              tabBarActiveTintColor: theme.primary,
              tabBarInactiveTintColor: theme.textLight,
              tabBarShowLabel: true,
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: "600",
                marginTop: -2,
              },
              tabBarStyle: {
                ...tabBarStyle,
                height: 75,
                paddingBottom: 15,
                paddingTop: 8,
              },
              headerStyle: headerStyle,
              headerTitleStyle: headerTitleStyle,
              headerTitleAlign: "center",
            })}
          >
            <Tab.Screen
              name="Feed"
              component={HomeScreen}
              options={{
                headerShown: false,
                tabBarLabel: "Clock",
              }}
            />
            <Tab.Screen
              name="Discover"
              component={SearchScreen}
              options={{
                headerShown: false,
                tabBarLabel: "Search",
                tabBarItemStyle: { opacity: 0.4 },
              }}
              listeners={{
                tabPress: (e) => {
                  e.preventDefault(); // Disable navigation
                },
              }}
            />
            <Tab.Screen
              name="Camera"
              component={AddReviewScreen}
              options={{
                headerShown: false,
                tabBarLabel: "", // Empty label for center button
              }}
            />
            <Tab.Screen
              name="Activity"
              component={ActivityScreen}
              options={{
                headerShown: false,
                tabBarLabel: "Log",
              }}
            />
            <Tab.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: false,
                tabBarLabel: "Journey",
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
