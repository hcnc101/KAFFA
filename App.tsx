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

// Replace the old CameraButton with your bean heart logo
const BeanHeartButton = () => (
  <View
    style={{
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#8B4513", // Coffee brown
      justifyContent: "center",
      alignItems: "center",
      marginTop: -15, // Elevate above other tabs
      borderWidth: 4,
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
        width: 32,
        height: 32,
        tintColor: "white",
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
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === "Feed") {
                  iconName = focused ? "home" : "home-outline";
                } else if (route.name === "Discover") {
                  iconName = focused ? "search" : "search-outline";
                } else if (route.name === "Camera") {
                  return <BeanHeartButton />; // Use your custom logo
                } else if (route.name === "Activity") {
                  iconName = focused ? "heart" : "heart-outline";
                } else if (route.name === "Profile") {
                  iconName = focused ? "person" : "person-outline";
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: theme.primary,
              tabBarInactiveTintColor: theme.textLight,
              tabBarShowLabel: false,
              tabBarStyle: tabBarStyle,
              headerStyle: headerStyle,
              headerTitleStyle: headerTitleStyle,
              headerTitleAlign: "center",
            })}
          >
            <Tab.Screen
              name="Feed"
              component={HomeScreen}
              options={{
                title: "Kaffa",
              }}
            />
            <Tab.Screen
              name="Discover"
              component={SearchScreen}
              options={{
                title: "Discover",
              }}
            />
            <Tab.Screen
              name="Camera"
              component={AddReviewScreen}
              options={{
                title: "New Coffee",
              }}
            />
            <Tab.Screen
              name="Activity"
              component={ActivityScreen}
              options={{
                title: "Activity",
              }}
            />
            <Tab.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                title: "Profile & Reviews",
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
