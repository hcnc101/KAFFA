import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeProvider } from "@rneui/themed";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Icon } from "@rneui/themed";
import { StatusBar, View } from "react-native";

// Import screens (we'll create these next)
import HomeScreen from "./src/screens/HomeScreen";
import SearchScreen from "./src/screens/SearchScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import AddReviewScreen from "./src/screens/AddReviewScreen";
import ActivityScreen from "./src/screens/ActivityScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

const CameraButton = () => (
  <View
    style={{
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      marginTop: -30, // Pull up the button
      borderWidth: 3,
      borderColor: "#FFF",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    }}
  >
    <Icon name="camera-alt" type="material" color="#FFF" size={24} />
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

                switch (route.name) {
                  case "Feed":
                    iconName = "home";
                    break;
                  case "Discover":
                    iconName = "search";
                    break;
                  case "Camera":
                    return <CameraButton />;
                  case "Activity":
                    iconName = "favorite-outline";
                    break;
                  case "Profile":
                    iconName = "person";
                    break;
                  default:
                    iconName = "circle";
                }

                return (
                  <Icon
                    name={iconName}
                    type="material"
                    size={size}
                    color={color}
                  />
                );
              },
              tabBarActiveTintColor: theme.primary,
              tabBarInactiveTintColor: theme.textLight,
              tabBarShowLabel: false, // Hide labels like Instagram
              tabBarStyle: {
                backgroundColor: theme.background,
                borderTopColor: "#E0E0E0",
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
              },
              headerStyle: {
                backgroundColor: theme.background,
                elevation: 0, // Remove shadow on Android
                shadowOpacity: 0, // Remove shadow on iOS
                borderBottomWidth: 1,
                borderBottomColor: "#E0E0E0",
              },
              headerTitleStyle: {
                color: theme.primary,
                fontSize: 20,
                fontWeight: "600",
              },
              headerTitleAlign: "center",
            })}
          >
            <Tab.Screen
              name="Feed"
              component={HomeScreen}
              options={{
                title: "Espressoo",
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
                title: "Profile",
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
