import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  Alert,
  AppState,
  DeviceEventEmitter,
  Image,
  ImageStyle,
  Vibration,
  Animated,
} from "react-native";
import { Text, Card, Button, Icon, Input, ListItem } from "@rneui/themed";
import Svg, { Circle, Path, Text as SvgText, Line, G } from "react-native-svg";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CLOCK_SIZE = SCREEN_WIDTH * 0.8;
const CLOCK_RADIUS = CLOCK_SIZE / 2 - 40;

// Theme colors
const theme = {
  primary: "#8B4513", // Coffee brown
  secondary: "#C4A484", // Lighter brown
  background: "#FFFFFF",
  surface: "#F5F5F5",
  accent: "#D4AF37", // Gold
  text: "#333333",
  textLight: "#666666",
  caffeine: "#FF6B35", // Orange for caffeine
  cortisol: "#4ECDC4", // Teal for cortisol
  sleep: "#6C5CE7", // Purple for sleep zone
};

// Updated coffee types with British measurements (mL) and more varieties
const coffeeTypes = [
  {
    name: "Espresso",
    volume: 30,
    caffeine: 75,
    icon: "local-cafe",
    category: "black",
  },
  {
    name: "Double Espresso",
    volume: 60,
    caffeine: 150,
    icon: "local-cafe",
    category: "black",
  },
  {
    name: "Americano",
    volume: 200,
    caffeine: 150,
    icon: "coffee",
    category: "black",
  },
  {
    name: "Long Black",
    volume: 180,
    caffeine: 140,
    icon: "coffee",
    category: "black",
  },
  {
    name: "Filter Coffee",
    volume: 250,
    caffeine: 120,
    icon: "coffee",
    category: "black",
  },
  {
    name: "Cappuccino",
    volume: 180,
    caffeine: 75,
    icon: "local-cafe",
    category: "milk",
    defaultMilk: "semi-skimmed",
  },
  {
    name: "Latte",
    volume: 250,
    caffeine: 75,
    icon: "local-cafe",
    category: "milk",
    defaultMilk: "semi-skimmed",
  },
  {
    name: "Flat White",
    volume: 160,
    caffeine: 130,
    icon: "local-cafe",
    category: "milk",
    defaultMilk: "whole",
  },
  {
    name: "Cortado",
    volume: 120,
    caffeine: 75,
    icon: "local-cafe",
    category: "milk",
    defaultMilk: "whole",
  },
  {
    name: "Macchiato",
    volume: 60,
    caffeine: 75,
    icon: "local-cafe",
    category: "milk",
    defaultMilk: "semi-skimmed",
  },
  {
    name: "Mocha",
    volume: 250,
    caffeine: 95,
    icon: "local-cafe",
    category: "milk",
    defaultMilk: "whole",
  },
  {
    name: "Cold Brew",
    volume: 250,
    caffeine: 200,
    icon: "ac-unit",
    category: "black",
  },
  {
    name: "Iced Coffee",
    volume: 250,
    caffeine: 120,
    icon: "ac-unit",
    category: "black",
  },
  {
    name: "Tea (English Breakfast)",
    volume: 250,
    caffeine: 50,
    icon: "emoji-food-beverage",
    category: "black",
  },
  {
    name: "Earl Grey",
    volume: 250,
    caffeine: 45,
    icon: "emoji-food-beverage",
    category: "black",
  },
  {
    name: "Green Tea",
    volume: 250,
    caffeine: 35,
    icon: "emoji-food-beverage",
    category: "black",
  },
  {
    name: "Energy Drink",
    volume: 250,
    caffeine: 80,
    icon: "battery-charging-full",
    category: "black",
  },
];

// Milk types and their effects on caffeine absorption
const milkTypes = [
  {
    name: "No Milk",
    absorptionDelay: 0, // minutes
    caffeineReduction: 0, // percentage
    peakDelay: 0, // additional minutes to peak
  },
  {
    name: "Skimmed",
    absorptionDelay: 5,
    caffeineReduction: 0.02, // 2% reduction
    peakDelay: 5,
  },
  {
    name: "Semi-Skimmed",
    absorptionDelay: 8,
    caffeineReduction: 0.05, // 5% reduction
    peakDelay: 10,
  },
  {
    name: "Whole Milk",
    absorptionDelay: 12,
    caffeineReduction: 0.12, // 12% reduction
    peakDelay: 20,
  },
  {
    name: "Oat Milk",
    absorptionDelay: 6,
    caffeineReduction: 0.03, // 3% reduction
    peakDelay: 7,
  },
  {
    name: "Almond Milk",
    absorptionDelay: 3,
    caffeineReduction: 0.01, // 1% reduction
    peakDelay: 3,
  },
  {
    name: "Soy Milk",
    absorptionDelay: 7,
    caffeineReduction: 0.04, // 4% reduction
    peakDelay: 8,
  },
];

interface CoffeeEntry {
  id: string;
  type: string;
  volume: number; // mL
  caffeine: number;
  timestamp: Date;
  peakTime: Date;
  halfLifeTime: Date;
  dateKey: string;
  milkType?: string; // Add milk type
  effectiveCaffeine: number; // Caffeine after milk absorption effects
}

interface ActivityLog {
  timestamp: Date;
  type: "app_active" | "significant_activity";
}

const HomeScreen = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [wakeUpTime, setWakeUpTime] = useState(
    new Date(new Date().setHours(7, 0, 0, 0))
  );
  const [bedTime, setBedTime] = useState(
    new Date(new Date().setHours(22, 0, 0, 0))
  );
  const [coffeeEntries, setCoffeeEntries] = useState<CoffeeEntry[]>([]);
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [showClockView, setShowClockView] = useState(true);
  const [currentDateKey, setCurrentDateKey] = useState(getDateKey(new Date()));
  const [lastAppState, setLastAppState] = useState(AppState.currentState);
  const [todaysWakeUpDetected, setTodaysWakeUpDetected] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [lastInactiveTime, setLastInactiveTime] = useState<Date | null>(null);
  const [showWakeUpSettings, setShowWakeUpSettings] = useState(false);
  const [show24Hour, setShow24Hour] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [selectedCoffee, setSelectedCoffee] = useState<any>(null);
  const [selectedMilk, setSelectedMilk] = useState<any>(milkTypes[0]);
  const [showMilkSelector, setShowMilkSelector] = useState(false);

  // Move the scrollViewRef to the top level (fix the hooks error)
  const scrollViewRef = useRef<ScrollView>(null);

  // Helper function to get date key (YYYY-MM-DD)
  function getDateKey(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  // Helper function to check if it's a new day
  const checkForNewDay = () => {
    const todayKey = getDateKey(new Date());
    if (todayKey !== currentDateKey) {
      // New day detected - reset coffee entries and wake-up detection
      setCurrentDateKey(todayKey);
      setCoffeeEntries([]);
      setTodaysWakeUpDetected(false);
      setActivityLog([]); // Reset activity log for new day
      setLastInactiveTime(null);
      console.log("New day detected, resetting all daily data");
    }
  };

  // Smart wake-up detection based on activity patterns
  const detectWakeUpFromActivity = () => {
    const now = new Date();
    const todayKey = getDateKey(now);

    // Only detect once per day and within reasonable hours (4 AM - 11 AM)
    if (todaysWakeUpDetected || now.getHours() < 4 || now.getHours() > 11) {
      return;
    }

    // Check if this is the first significant activity after a long period of inactivity
    const lastActivity = activityLog[activityLog.length - 1];
    const timeSinceLastActivity = lastActivity
      ? (now.getTime() - lastActivity.timestamp.getTime()) / (1000 * 60 * 60)
      : 8; // Default 8 hours

    // Consider this wake-up if:
    // 1. It's been more than 6 hours since last activity (assuming sleep)
    // 2. It's morning hours
    // 3. We haven't detected wake-up today yet
    if (
      timeSinceLastActivity >= 6 &&
      now.getHours() >= 5 &&
      now.getHours() <= 10
    ) {
      setWakeUpTime(now);
      setTodaysWakeUpDetected(true);
      console.log(`Smart wake-up detected: ${now.toLocaleTimeString()}`);

      Alert.alert(
        "Good Morning! 🌅",
        `I detected your wake-up time as ${now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} based on your phone activity pattern. This will optimize your coffee timing recommendations.`,
        [
          { text: "Perfect! ✅" },
          {
            text: "Adjust Time ⚙️",
            onPress: () => setShowWakeUpSettings(true),
          },
        ]
      );
    }
  };

  // Log activity when app becomes active
  const logActivity = (type: "app_active" | "significant_activity") => {
    const now = new Date();
    const newActivity: ActivityLog = {
      timestamp: now,
      type: type,
    };

    setActivityLog((prev) => [...prev.slice(-10), newActivity]); // Keep last 10 activities

    // Try to detect wake-up
    detectWakeUpFromActivity();
  };

  // Enhanced app state detection
  useEffect(() => {
    const handleAppStateChange = (nextAppState: any) => {
      const now = new Date();

      if (
        lastAppState.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App became active - but don't update activityLog in dependency
        const newActivity: ActivityLog = {
          timestamp: now,
          type: "app_active",
        };

        setActivityLog((prev) => [...prev.slice(-10), newActivity]);

        // Try to detect wake-up without depending on activityLog
        if (
          !todaysWakeUpDetected &&
          now.getHours() >= 5 &&
          now.getHours() <= 10
        ) {
          const timeSinceLastActivity = lastInactiveTime
            ? (now.getTime() - lastInactiveTime.getTime()) / (1000 * 60 * 60)
            : 8;

          if (timeSinceLastActivity >= 6) {
            setWakeUpTime(now);
            setTodaysWakeUpDetected(true);
            console.log(`Smart wake-up detected: ${now.toLocaleTimeString()}`);

            Alert.alert(
              "Good Morning! 🌅",
              `I detected your wake-up time as ${now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })} based on your phone activity pattern.`,
              [
                { text: "Perfect! ✅" },
                {
                  text: "Adjust Time ⚙️",
                  onPress: () => setShowWakeUpSettings(true),
                },
              ]
            );
          }
        }

        if (lastInactiveTime) {
          const inactiveHours =
            (now.getTime() - lastInactiveTime.getTime()) / (1000 * 60 * 60);
          if (inactiveHours >= 4) {
            console.log(
              `Long inactivity detected: ${inactiveHours.toFixed(1)} hours`
            );
          }
        }
      } else if (nextAppState.match(/inactive|background/)) {
        setLastInactiveTime(now);
      }

      setLastAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => subscription?.remove();
  }, []); // Remove all dependencies to prevent infinite loop

  // Manual wake-up time adjustment
  const adjustWakeUpTime = (adjustment: number) => {
    const newWakeUpTime = new Date(
      wakeUpTime.getTime() + adjustment * 60 * 60000
    ); // adjustment in hours
    setWakeUpTime(newWakeUpTime);
    console.log(
      `Wake-up time adjusted to: ${newWakeUpTime.toLocaleTimeString()}`
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      checkForNewDay();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentDateKey]); // Only depend on currentDateKey

  useEffect(() => {
    checkForNewDay();
  }, []);

  const addCoffeeEntry = (coffeeType: any, milkType: any = milkTypes[0]) => {
    const now = new Date();

    // Calculate caffeine absorption with milk effects
    const milkEffect = milkType || milkTypes[0];
    const effectiveCaffeine =
      coffeeType.caffeine * (1 - milkEffect.caffeineReduction);
    const absorptionTime = 45 + milkEffect.peakDelay; // Base 45min + milk delay

    const peakTime = new Date(now.getTime() + absorptionTime * 60000);
    const halfLifeTime = new Date(now.getTime() + 5.5 * 60 * 60000);

    const entry: CoffeeEntry = {
      id: Date.now().toString(),
      type: coffeeType.name,
      volume: coffeeType.volume,
      caffeine: coffeeType.caffeine,
      effectiveCaffeine: effectiveCaffeine,
      timestamp: now,
      peakTime,
      halfLifeTime,
      dateKey: getDateKey(now),
      milkType: milkType.name,
    };

    // STREAMLINED FEEDBACK
    setCoffeeEntries((prev) => [...prev, entry]);
    setShowCoffeeModal(false);
    setShowClockView(true);
    setCurrentTime(new Date());

    // Enhanced toast with milk info
    const milkInfo =
      milkType.name !== "No Milk"
        ? ` with ${milkType.name.toLowerCase()} milk`
        : "";
    showSuccessToast(
      `☕ ${coffeeType.name}${milkInfo} logged - ${Math.round(
        effectiveCaffeine
      )}mg effective caffeine`
    );

    Vibration.vibrate(50);
    logActivity("significant_activity");
  };

  // Smooth toast notification
  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);

    // Smooth fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide after 2 seconds
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowToast(false);
      });
    }, 2000);
  };

  // Get today's coffee entries only
  const getTodaysCoffeeEntries = () => {
    const todayKey = getDateKey(currentTime);
    return coffeeEntries.filter((entry) => entry.dateKey === todayKey);
  };

  // Updated caffeine calculation with milk effects
  const getCurrentCaffeineLevel = (atTime?: Date) => {
    const now = (atTime || currentTime).getTime();
    const todaysEntries = getTodaysCoffeeEntries();
    let totalCaffeine = 0;

    todaysEntries.forEach((entry) => {
      const timeElapsed = (now - entry.timestamp.getTime()) / (1000 * 60 * 60);
      if (timeElapsed >= 0 && timeElapsed <= 24) {
        const milkEffect =
          milkTypes.find((m) => m.name === entry.milkType) || milkTypes[0];
        const absorptionTime = (45 + milkEffect.peakDelay) / 60;

        if (timeElapsed <= absorptionTime) {
          totalCaffeine +=
            entry.effectiveCaffeine * (timeElapsed / absorptionTime);
        } else {
          const decayTime = timeElapsed - absorptionTime;
          totalCaffeine +=
            entry.effectiveCaffeine * Math.pow(0.5, decayTime / 5.5);
        }
      }
    });

    return totalCaffeine;
  };

  const getTodaysTotalCaffeine = () => {
    const todaysEntries = getTodaysCoffeeEntries();
    return todaysEntries.reduce((total, entry) => total + entry.caffeine, 0);
  };

  const getCortisolWindow = () => {
    const start = new Date(wakeUpTime);
    const end = new Date(wakeUpTime.getTime() + 90 * 60000);
    const isInWindow = currentTime >= start && currentTime <= end;

    return {
      isInWindow,
      endTime: end,
      startHour: start.getHours(),
      endHour: end.getHours(),
    };
  };

  const getSleepImpactWindow = () => {
    const start = new Date(bedTime.getTime() - 6 * 60 * 60000);
    const isInWindow = currentTime >= start && currentTime <= bedTime;

    return {
      isInWindow,
      startTime: start,
      startHour: start.getHours(),
      endHour: bedTime.getHours(),
    };
  };

  const renderCoffeeClock = () => {
    const centerX = CLOCK_SIZE / 2;
    const centerY = CLOCK_SIZE / 2;
    const currentCaffeine = getCurrentCaffeineLevel();
    const maxCaffeine = 400;

    const caffeinePercentage = Math.min(currentCaffeine / maxCaffeine, 1);
    const caffeineAngle = caffeinePercentage * 360;

    // Update timeToAngle for 24hr support
    const timeToAngle = (hours: number, minutes: number = 0) => {
      if (show24Hour) {
        return hours * 15 + minutes * 0.25 - 90; // 360/24 = 15 degrees per hour
      } else {
        return (hours % 12) * 30 + minutes * 0.5 - 90; // 360/12 = 30 degrees per hour
      }
    };

    const createArcPath = (
      startAngle: number,
      endAngle: number,
      radius: number
    ) => {
      if (Math.abs(endAngle - startAngle) < 0.1) {
        return "";
      }

      const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
      const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
      const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
      const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

      return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
    };

    return (
      <View style={styles.clockContainer}>
        {/* REDESIGNED CLOCK FACE */}
        <View style={styles.modernClockFace}>
          <Svg width={CLOCK_SIZE} height={CLOCK_SIZE}>
            {/* Clean background */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={CLOCK_RADIUS}
              fill="white"
              stroke="#F0F0F0"
              strokeWidth="2"
            />

            {/* REVERT BACK TO ORIGINAL HALF-LIFE ARCS */}
            {getTodaysCoffeeEntries().map((entry, index) => {
              const now = currentTime.getTime();
              const timeElapsed =
                (now - entry.timestamp.getTime()) / (1000 * 60 * 60);

              if (timeElapsed < 0 || timeElapsed > 12) return null;

              // Calculate current caffeine level
              let currentLevel;
              const milkEffect =
                milkTypes.find((m) => m.name === entry.milkType) ||
                milkTypes[0];
              const absorptionTime = (45 + milkEffect.peakDelay) / 60; // Convert to hours

              if (timeElapsed <= absorptionTime) {
                currentLevel =
                  entry.effectiveCaffeine * (timeElapsed / absorptionTime);
              } else {
                const decayTime = timeElapsed - absorptionTime;
                currentLevel =
                  entry.effectiveCaffeine * Math.pow(0.5, decayTime / 5.5);
              }

              if (currentLevel < 1) return null;

              // Arc positioning
              const logTime = entry.timestamp;
              const startAngle = timeToAngle(
                logTime.getHours(),
                logTime.getMinutes()
              );
              const endTime = new Date(
                entry.timestamp.getTime() + 12 * 60 * 60 * 1000
              );
              const endAngle = timeToAngle(
                endTime.getHours(),
                endTime.getMinutes()
              );

              const progressRatio = Math.min(timeElapsed / 12, 1);
              const currentAngle =
                startAngle + (endAngle - startAngle) * progressRatio;
              const radius = CLOCK_RADIUS - 60 - index * 25;

              // CHECK IF THIS COFFEE AFFECTS SLEEP
              const sixHoursBeforeBed = new Date(
                bedTime.getTime() - 6 * 60 * 60 * 1000
              );
              const sleepStartAngle = timeToAngle(
                sixHoursBeforeBed.getHours(),
                sixHoursBeforeBed.getMinutes()
              );
              const bedAngle = timeToAngle(
                bedTime.getHours(),
                bedTime.getMinutes()
              );

              // Check if the remaining caffeine arc overlaps with sleep zone
              const affectsSleep =
                (currentAngle <= bedAngle && endAngle >= sleepStartAngle) ||
                (currentAngle >= sleepStartAngle && currentAngle <= bedAngle);

              // Colors - red/orange for sleep conflicts, normal colors otherwise
              const baseColors = [
                "#FF6B35",
                "#FF8C42",
                "#FFA726",
                "#FFB74D",
                "#FFCC02",
              ];
              const conflictColors = [
                "#FF4444",
                "#FF6666",
                "#FF8888",
                "#FFAAAA",
                "#FFCCCC",
              ];
              const color = affectsSleep
                ? conflictColors[index % conflictColors.length]
                : baseColors[index % baseColors.length];

              return (
                <G key={`coffee-halflife-${entry.id}`}>
                  {/* Full decay path */}
                  <Path
                    d={createArcPath(startAngle, endAngle, radius)}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeOpacity="0.2"
                    strokeLinecap="round"
                  />

                  {/* Active remaining caffeine - highlight if affects sleep */}
                  <Path
                    d={createArcPath(currentAngle, endAngle, radius)}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeOpacity={affectsSleep ? 0.9 : 0.7}
                    strokeLinecap="round"
                    strokeDasharray={affectsSleep ? "8,4" : "none"} // Dashed line for sleep conflict
                  />

                  {/* Current position dot */}
                  <Circle
                    cx={
                      centerX +
                      radius * Math.cos((currentAngle * Math.PI) / 180)
                    }
                    cy={
                      centerY +
                      radius * Math.sin((currentAngle * Math.PI) / 180)
                    }
                    r="6"
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                  />

                  {/* Coffee start marker */}
                  <Circle
                    cx={
                      centerX + radius * Math.cos((startAngle * Math.PI) / 180)
                    }
                    cy={
                      centerY + radius * Math.sin((startAngle * Math.PI) / 180)
                    }
                    r="4"
                    fill="white"
                    stroke={color}
                    strokeWidth="3"
                  />
                </G>
              );
            })}

            {/* CORTISOL WINDOW */}
            {(() => {
              const wakeHour = wakeUpTime.getHours();
              const wakeMinute = wakeUpTime.getMinutes();
              const endHour =
                Math.floor((wakeHour * 60 + wakeMinute + 90) / 60) % 24;
              const endMinute = (wakeMinute + 90) % 60;

              const startAngle = timeToAngle(wakeHour, wakeMinute);
              const endAngle = timeToAngle(endHour, endMinute);

              return (
                <Path
                  d={createArcPath(startAngle, endAngle, CLOCK_RADIUS - 15)}
                  fill="none"
                  stroke="#00BCD4"
                  strokeWidth="20"
                  strokeOpacity="0.3"
                  strokeLinecap="round"
                />
              );
            })()}

            {/* SLEEP IMPACT WINDOW */}
            {(() => {
              const bedHour = bedTime.getHours();
              const bedMinute = bedTime.getMinutes();
              const startHour = Math.floor(
                (bedHour * 60 + bedMinute - 360) / 60
              );
              const adjustedStartHour =
                startHour >= 0 ? startHour : startHour + 24;

              const startAngle = timeToAngle(adjustedStartHour, bedMinute);
              const endAngle = timeToAngle(bedHour, bedMinute);

              return (
                <Path
                  d={createArcPath(startAngle, endAngle, CLOCK_RADIUS - 15)}
                  fill="none"
                  stroke="#9C27B0"
                  strokeWidth="20"
                  strokeOpacity="0.3"
                  strokeLinecap="round"
                />
              );
            })()}

            {/* Hour markers */}
            {show24Hour
              ? [0, 6, 12, 18].map((i) => {
                  const angle = i * 15 - 90;
                  const markerStart = CLOCK_RADIUS - 20;
                  const markerEnd = CLOCK_RADIUS - 5;

                  return (
                    <Line
                      key={`marker-${i}`}
                      x1={
                        centerX +
                        markerStart * Math.cos((angle * Math.PI) / 180)
                      }
                      y1={
                        centerY +
                        markerStart * Math.sin((angle * Math.PI) / 180)
                      }
                      x2={
                        centerX + markerEnd * Math.cos((angle * Math.PI) / 180)
                      }
                      y2={
                        centerY + markerEnd * Math.sin((angle * Math.PI) / 180)
                      }
                      stroke="#666"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  );
                })
              : [0, 3, 6, 9].map((i) => {
                  const angle = i * 30 - 90;
                  const markerStart = CLOCK_RADIUS - 20;
                  const markerEnd = CLOCK_RADIUS - 5;

                  return (
                    <Line
                      key={`marker-${i}`}
                      x1={
                        centerX +
                        markerStart * Math.cos((angle * Math.PI) / 180)
                      }
                      y1={
                        centerY +
                        markerStart * Math.sin((angle * Math.PI) / 180)
                      }
                      x2={
                        centerX + markerEnd * Math.cos((angle * Math.PI) / 180)
                      }
                      y2={
                        centerY + markerEnd * Math.sin((angle * Math.PI) / 180)
                      }
                      stroke="#666"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  );
                })}

            {/* Clock hands - properly positioned for 24hr */}
            {(() => {
              const hours = currentTime.getHours();
              const minutes = currentTime.getMinutes();

              const hourAngle = show24Hour
                ? hours * 15 + minutes * 0.25 - 90 // 24hr: 15 degrees per hour
                : (hours % 12) * 30 + minutes * 0.5 - 90; // 12hr: 30 degrees per hour
              const minuteAngle = minutes * 6 - 90;

              return (
                <G>
                  {/* Hour hand */}
                  <Line
                    x1={centerX}
                    y1={centerY}
                    x2={
                      centerX +
                      (CLOCK_RADIUS - 120) *
                        Math.cos((hourAngle * Math.PI) / 180)
                    }
                    y2={
                      centerY +
                      (CLOCK_RADIUS - 120) *
                        Math.sin((hourAngle * Math.PI) / 180)
                    }
                    stroke="#8B4513"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />

                  {/* Minute hand */}
                  <Line
                    x1={centerX}
                    y1={centerY}
                    x2={
                      centerX +
                      (CLOCK_RADIUS - 100) *
                        Math.cos((minuteAngle * Math.PI) / 180)
                    }
                    y2={
                      centerY +
                      (CLOCK_RADIUS - 100) *
                        Math.sin((minuteAngle * Math.PI) / 180)
                    }
                    stroke="#8B4513"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* Center dot */}
                  <Circle cx={centerX} cy={centerY} r="8" fill="#8B4513" />
                </G>
              );
            })()}
          </Svg>

          {/* SMALLER CENTER DISPLAY - doesn't hide arcs */}
          <View style={styles.smallerCenterDisplay}>
            <Text style={styles.smallerCaffeineAmount}>
              {Math.round(currentCaffeine)}
            </Text>
            <Text style={styles.smallerCaffeineUnit}>mg</Text>
          </View>

          {/* REMOVE TOP DIGITAL TIME - hands show the time */}

          {/* OUTSIDE NUMBERS */}
          {(show24Hour
            ? Array.from({ length: 24 }, (_, i) => i)
            : [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
          ).map((hour, index) => {
            const angle = show24Hour ? hour * 15 - 90 : index * 30 - 90;
            const numberRadius = CLOCK_RADIUS + 25;
            const x =
              centerX + numberRadius * Math.cos((angle * Math.PI) / 180);
            const y =
              centerY + numberRadius * Math.sin((angle * Math.PI) / 180);

            return (
              <View
                key={`${show24Hour ? "24h" : "12h"}-${hour}-${index}`}
                style={[
                  styles.clockNumber,
                  show24Hour && styles.clockNumber24,
                  {
                    position: "absolute",
                    left: x - (show24Hour ? 15 : 20),
                    top: y - (show24Hour ? 15 : 20),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.clockNumberText,
                    show24Hour && styles.clockNumber24Text,
                  ]}
                >
                  {show24Hour ? hour : hour === 0 ? 12 : hour}
                </Text>
              </View>
            );
          })}
        </View>

        {/* CLEARER SCIENCE ZONES EXPLANATION */}
        <View style={styles.improvedScienceZones}>
          <Text style={styles.scienceZonesTitle}>☀️ Coffee Science Zones</Text>

          <View style={styles.scienceZoneCard}>
            <View style={styles.zoneCardHeader}>
              <View
                style={[
                  styles.zoneIndicatorLarge,
                  { backgroundColor: "#00BCD4" },
                ]}
              />
              <Text style={styles.zoneCardTitle}>Cortisol Peak Zone</Text>
            </View>
            <Text style={styles.zoneCardDescription}>
              Wait 90 minutes after waking before drinking coffee for optimal
              effectiveness
            </Text>
            <Text style={styles.zoneCardTime}>
              {wakeUpTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(wakeUpTime.getTime() + 90 * 60000).toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
              )}
            </Text>
          </View>

          <View style={styles.scienceZoneCard}>
            <View style={styles.zoneCardHeader}>
              <View
                style={[
                  styles.zoneIndicatorLarge,
                  { backgroundColor: "#9C27B0" },
                ]}
              />
              <Text style={styles.zoneCardTitle}>Sleep Impact Zone</Text>
            </View>
            <Text style={styles.zoneCardDescription}>
              Coffee consumed now may affect your sleep quality tonight
            </Text>
            <Text style={styles.zoneCardTime}>
              {new Date(bedTime.getTime() - 6 * 60 * 60000).toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
              )}
              -{" "}
              {bedTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Auto-scroll to current time when switching to timeline view (fix the auto-scroll)
  useEffect(() => {
    if (scrollViewRef.current && !showClockView) {
      // Much better auto-scroll - center on current time immediately
      const currentHour = currentTime.getHours();
      // Each hour card is 120px wide + 10px margin = 130px
      // Center the current hour by scrolling to show 2 hours before it
      const scrollToX = Math.max(0, (currentHour - 1.5) * 130);

      // Delay slightly to ensure component is mounted
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: scrollToX,
          animated: true,
        });
      }, 100);
    }
  }, [showClockView, currentTime.getHours()]);

  const renderTimelineView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const todaysEntries = getTodaysCoffeeEntries();

    // Calculate future caffeine predictions
    const getFutureCaffeineLevel = (hour: number) => {
      const futureTime = new Date();
      futureTime.setHours(hour, 0, 0, 0);
      return getCurrentCaffeineLevel(futureTime);
    };

    return (
      <View style={styles.timelineContainer}>
        {/* ELEGANT HEADER - consistent with clock */}
        <View style={styles.timelineHeaderRefined}>
          <Text style={styles.timelineTitleRefined}>24-Hour Timeline</Text>
          <View style={styles.currentStatusRefined}>
            <Text style={styles.currentTimeRefined}>
              {currentTime.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </Text>
            <Text style={styles.currentCaffeineRefined}>
              {Math.round(getCurrentCaffeineLevel())}mg
            </Text>
          </View>
        </View>

        {/* REFINED TIMELINE - consistent sizing with clock */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.timelineRefined}
          contentContainerStyle={styles.timelineContentRefined}
        >
          {hours.map((hour) => {
            const isCurrentHour = hour === currentHour;
            const isPastHour = hour < currentHour;
            const isFutureHour = hour > currentHour;

            // Find events in this hour
            const hourCoffees = todaysEntries.filter(
              (entry) => entry.timestamp.getHours() === hour
            );
            const hourPeaks = todaysEntries.filter(
              (entry) => entry.peakTime.getHours() === hour
            );

            // Calculate caffeine levels (current and predicted)
            const hourCaffeineLevel = getFutureCaffeineLevel(hour);
            const caffeineHeight = Math.min((hourCaffeineLevel / 400) * 60, 60);

            // Check for science windows
            const cortisolWindow = getCortisolWindow();
            const sleepWindow = getSleepImpactWindow();
            let windowType = null;

            if (
              hour >= cortisolWindow.startHour &&
              hour <= cortisolWindow.endHour
            ) {
              windowType = "cortisol";
            } else if (
              hour >= sleepWindow.startHour &&
              hour <= sleepWindow.endHour
            ) {
              windowType = "sleep";
            }

            return (
              <View
                key={hour}
                style={[
                  styles.timelineHourRefined,
                  isCurrentHour && styles.currentTimelineHourRefined,
                  isPastHour && styles.pastTimelineHourRefined,
                ]}
              >
                {/* Hour label */}
                <Text
                  style={[
                    styles.hourLabelRefined,
                    isCurrentHour && styles.currentHourLabelRefined,
                  ]}
                >
                  {hour.toString().padStart(2, "0")}
                </Text>

                {/* Current time indicator */}
                {isCurrentHour && (
                  <View style={styles.currentTimeIndicatorRefined}>
                    <Text style={styles.currentMinutesRefined}>
                      :{currentMinutes.toString().padStart(2, "0")}
                    </Text>
                  </View>
                )}

                {/* PREDICTIVE CAFFEINE ARC */}
                <View style={styles.caffeineVisualizationRefined}>
                  <View
                    style={[
                      styles.caffeineBarRefined,
                      {
                        height: Math.max(caffeineHeight, 2),
                        backgroundColor: isCurrentHour
                          ? "#FF6B35"
                          : isPastHour
                          ? "#FF8A65"
                          : isFutureHour
                          ? "rgba(255, 107, 53, 0.3)" // Predictive - lighter
                          : "#FFE0B2",
                      },
                    ]}
                  />
                  {hourCaffeineLevel > 5 && (
                    <Text style={styles.caffeineAmountRefined}>
                      {Math.round(hourCaffeineLevel)}
                    </Text>
                  )}
                </View>

                {/* Coffee consumption events */}
                {hourCoffees.map((coffee) => (
                  <View
                    key={coffee.id}
                    style={[
                      styles.coffeeEventRefined,
                      { left: (coffee.timestamp.getMinutes() / 60) * 70 },
                    ]}
                  >
                    <View style={styles.coffeeIconRefined}>
                      <Text style={styles.coffeeEmojiRefined}>☕</Text>
                    </View>
                    <Text style={styles.coffeeTimeRefined}>
                      {coffee.timestamp.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </Text>
                  </View>
                ))}

                {/* Peak events */}
                {hourPeaks.map((peak) => (
                  <View
                    key={`peak-${peak.id}`}
                    style={[
                      styles.peakEventRefined,
                      { left: (peak.peakTime.getMinutes() / 60) * 70 },
                    ]}
                  >
                    <View style={styles.peakIconRefined}>
                      <Text style={styles.peakEmojiRefined}>⚡</Text>
                    </View>
                    <Text style={styles.peakTimeRefined}>
                      {peak.peakTime.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </Text>
                  </View>
                ))}

                {/* Science windows */}
                {windowType && (
                  <View
                    style={[
                      styles.scienceWindowRefined,
                      windowType === "cortisol"
                        ? styles.cortisolWindowRefined
                        : styles.sleepWindowRefined,
                    ]}
                  >
                    <Text style={styles.windowTextRefined}>
                      {windowType === "cortisol" ? "🧠" : "😴"}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* ELEGANT LEGEND - consistent with clock style */}
        <View style={styles.timelineLegendRefined}>
          <View style={styles.legendRowRefined}>
            <View style={styles.legendItemRefined}>
              <Text style={styles.legendIconRefined}>☕</Text>
              <Text style={styles.legendTextRefined}>Coffee</Text>
            </View>
            <View style={styles.legendItemRefined}>
              <Text style={styles.legendIconRefined}>⚡</Text>
              <Text style={styles.legendTextRefined}>Peak</Text>
            </View>
            <View style={styles.legendItemRefined}>
              <View style={styles.predictiveIndicatorRefined} />
              <Text style={styles.legendTextRefined}>Predicted levels</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const cortisolInfo = getCortisolWindow();
  const sleepInfo = getSleepImpactWindow();
  const todaysEntries = getTodaysCoffeeEntries();

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.headerRedesigned}>
          {/* Clock type toggle - LEFT SIDE */}
          <View style={styles.viewToggleRedesigned}>
            <TouchableOpacity
              onPress={() => setShowClockView(true)}
              style={[
                styles.toggleButtonRedesigned,
                showClockView && styles.activeToggleRedesigned,
              ]}
            >
              <Icon
                name="schedule"
                size={20}
                color={showClockView ? "white" : theme.text}
              />
              <Text
                style={[
                  styles.toggleLabelText,
                  showClockView && styles.activeToggleLabelText,
                ]}
              >
                Clock
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowClockView(false)}
              style={[
                styles.toggleButtonRedesigned,
                !showClockView && styles.activeToggleRedesigned,
              ]}
            >
              <Icon
                name="timeline"
                size={20}
                color={!showClockView ? "white" : theme.text}
              />
              <Text
                style={[
                  styles.toggleLabelText,
                  !showClockView && styles.activeToggleLabelText,
                ]}
              >
                Timeline
              </Text>
            </TouchableOpacity>
          </View>

          {/* 12hr/24hr toggle - RIGHT SIDE */}
          {showClockView && (
            <View style={styles.hourToggleRedesigned}>
              <TouchableOpacity
                onPress={() => setShow24Hour(false)}
                style={[
                  styles.hourButtonRedesigned,
                  !show24Hour && styles.activeHourButtonRedesigned,
                ]}
              >
                <Text
                  style={[
                    styles.hourTextRedesigned,
                    !show24Hour && styles.activeHourTextRedesigned,
                  ]}
                >
                  12hr
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShow24Hour(true)}
                style={[
                  styles.hourButtonRedesigned,
                  show24Hour && styles.activeHourButtonRedesigned,
                ]}
              >
                <Text
                  style={[
                    styles.hourTextRedesigned,
                    show24Hour && styles.activeHourTextRedesigned,
                  ]}
                >
                  24hr
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Main Display */}
        {showClockView ? renderCoffeeClock() : renderTimelineView()}

        {/* MOVE ACTIVE CAFFEINE TRACKING TO BE FIRST CARD */}
        <View style={styles.improvedHalfLifeLegend}>
          <Text style={styles.improvedLegendTitle}>
            ☕ Active Caffeine Tracking
          </Text>

          {getTodaysCoffeeEntries().length === 0 ? (
            <View style={styles.noCoffeePlaceholder}>
              <Text style={styles.noCoffeeText}>No coffee logged today</Text>
              <Text style={styles.noCoffeeSubtext}>
                Tap + to add your first coffee
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.legendSubtitle}>
                Real-time caffeine levels from today's drinks
              </Text>

              {getTodaysCoffeeEntries().map((entry, index) => {
                const now = currentTime.getTime();
                const timeElapsed =
                  (now - entry.timestamp.getTime()) / (1000 * 60 * 60);
                let currentLevel = 0;

                const milkEffect =
                  milkTypes.find((m) => m.name === entry.milkType) ||
                  milkTypes[0];
                const absorptionTime = (45 + milkEffect.peakDelay) / 60;

                if (timeElapsed >= 0 && timeElapsed <= 24) {
                  if (timeElapsed <= absorptionTime) {
                    currentLevel =
                      entry.effectiveCaffeine * (timeElapsed / absorptionTime);
                  } else {
                    const decayTime = timeElapsed - absorptionTime;
                    currentLevel =
                      entry.effectiveCaffeine * Math.pow(0.5, decayTime / 5.5);
                  }
                }

                if (currentLevel < 1) return null;

                return (
                  <View key={entry.id} style={styles.halfLifeItem}>
                    <View
                      style={[
                        styles.halfLifeColorDot,
                        {
                          backgroundColor: "#FF6B35",
                          opacity: Math.max(
                            0.6,
                            currentLevel / entry.effectiveCaffeine
                          ),
                        },
                      ]}
                    />
                    <View style={styles.halfLifeItemContent}>
                      <Text style={styles.halfLifeItemText}>
                        {entry.type}: {Math.round(currentLevel)}mg remaining
                        (started{" "}
                        {entry.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        )
                      </Text>

                      {/* ADD BACK THE ABSORPTION PROGRESS BAR */}
                      <View style={styles.absorptionProgressContainer}>
                        <View style={styles.absorptionProgressBar}>
                          <View
                            style={[
                              styles.absorptionProgressFill,
                              {
                                width: `${Math.min(
                                  (currentLevel / entry.effectiveCaffeine) *
                                    100,
                                  100
                                )}%`,
                                backgroundColor: "#FF6B35",
                                opacity: Math.max(
                                  0.7,
                                  currentLevel / entry.effectiveCaffeine
                                ),
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.absorptionPercentageText}>
                          {Math.round(
                            (currentLevel / entry.effectiveCaffeine) * 100
                          )}
                          % active
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}

              {/* Total Summary */}
              <View style={styles.totalSummaryCard}>
                <Text style={styles.totalSummaryTitle}>
                  Total Active Caffeine
                </Text>
                <Text style={styles.totalSummaryAmount}>
                  {Math.round(getCurrentCaffeineLevel())}mg
                </Text>
                <Text style={styles.totalSummarySubtext}>
                  from {getTodaysCoffeeEntries().length} drink
                  {getTodaysCoffeeEntries().length !== 1 ? "s" : ""} today
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Status Cards - Only if relevant */}
        {(cortisolInfo.isInWindow ||
          sleepInfo.isInWindow ||
          getCurrentCaffeineLevel() > 300) && (
          <View style={styles.statusContainer}>
            {cortisolInfo.isInWindow && (
              <Card
                containerStyle={[
                  styles.statusCard,
                  { borderLeftColor: theme.cortisol },
                ]}
              >
                <Text style={styles.statusTitle}>⏰ Cortisol Peak Active</Text>
                <Text style={styles.statusText}>
                  Wait until{" "}
                  {cortisolInfo.endTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  for optimal timing.
                </Text>
              </Card>
            )}

            {sleepInfo.isInWindow && (
              <Card
                containerStyle={[
                  styles.statusCard,
                  { borderLeftColor: theme.sleep },
                ]}
              >
                <Text style={styles.statusTitle}>🌙 Sleep Impact Zone</Text>
                <Text style={styles.statusText}>
                  Coffee now may affect sleep quality.
                </Text>
              </Card>
            )}

            {getCurrentCaffeineLevel() > 300 && (
              <Card containerStyle={styles.statusCard}>
                <Text style={styles.statusTitle}>⚠️ High Caffeine</Text>
                <Text style={styles.statusText}>
                  {Math.round(getCurrentCaffeineLevel())}mg / 400mg daily limit
                </Text>
              </Card>
            )}
          </View>
        )}

        {/* Coffee Log - Simplified with Remove Buttons */}
        <Card containerStyle={styles.logCard}>
          <Text style={styles.logTitle}>☕ Today's Coffee Log</Text>
          {getTodaysCoffeeEntries().length === 0 ? (
            <Text style={styles.emptyLogText}>No coffee logged today</Text>
          ) : (
            getTodaysCoffeeEntries().map((entry) => (
              <View key={entry.id} style={styles.logEntryWithRemove}>
                <View style={styles.logEntryContent}>
                  <Icon
                    name="local-cafe"
                    type="material"
                    color={theme.primary}
                    size={20}
                  />
                  <View style={styles.logEntryDetails}>
                    <Text style={styles.logEntryType}>
                      {entry.type}{" "}
                      {entry.milkType !== "None" && `+ ${entry.milkType}`}
                    </Text>
                    <Text style={styles.logEntryTime}>
                      {entry.timestamp.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}{" "}
                      • {entry.volume}mL • {entry.caffeine}mg
                    </Text>
                  </View>
                </View>

                {/* SIMPLE REMOVE BUTTON with minus icon */}
                <TouchableOpacity
                  style={styles.simpleRemoveButton}
                  onPress={() => {
                    Alert.alert(
                      "Remove Coffee",
                      `Remove ${
                        entry.type
                      } from ${entry.timestamp.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Remove",
                          style: "destructive",
                          onPress: () => {
                            setCoffeeEntries((prev) =>
                              prev.filter((coffee) => coffee.id !== entry.id)
                            );
                            showSuccessToast(`Removed ${entry.type}`);
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Icon name="remove" size={20} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      {/* Floating Add Coffee Button */}
      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={() => setShowCoffeeModal(true)}
      >
        <Icon name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* ENHANCED Coffee Selection Modal with Milk Options */}
      <Modal
        visible={showCoffeeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowCoffeeModal(false);
          setSelectedCoffee(null);
          setShowMilkSelector(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.modalScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.enhancedModalContent}>
              {!selectedCoffee ? (
                // Coffee Selection
                <>
                  <Text style={styles.modalTitle}>What are you drinking?</Text>
                  <Text style={styles.modalSubtitle}>
                    Choose your coffee type (measurements in mL)
                  </Text>

                  {/* Black Coffees */}
                  <Text style={styles.categoryTitle}>☕ Black Coffee</Text>
                  {coffeeTypes
                    .filter((coffee) => coffee.category === "black")
                    .map((coffee) => (
                      <TouchableOpacity
                        key={coffee.name}
                        style={styles.coffeeOptionEnhanced}
                        onPress={() => {
                          if (coffee.category === "milk") {
                            setSelectedCoffee(coffee);
                            setShowMilkSelector(true);
                          } else {
                            addCoffeeEntry(coffee, milkTypes[0]); // No milk
                          }
                        }}
                      >
                        <Icon
                          name={coffee.icon}
                          type="material"
                          color={theme.primary}
                          size={28}
                        />
                        <View style={styles.coffeeInfo}>
                          <Text style={styles.coffeeName}>{coffee.name}</Text>
                          <Text style={styles.volumeInfo}>
                            {coffee.volume}mL
                          </Text>
                          <Text style={styles.caffeineContent}>
                            {coffee.caffeine}mg caffeine
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}

                  {/* Milk-based Coffees */}
                  <Text style={styles.categoryTitle}>🥛 Milk-based Coffee</Text>
                  {coffeeTypes
                    .filter((coffee) => coffee.category === "milk")
                    .map((coffee) => (
                      <TouchableOpacity
                        key={coffee.name}
                        style={styles.coffeeOptionEnhanced}
                        onPress={() => {
                          setSelectedCoffee(coffee);
                          setSelectedMilk(
                            milkTypes.find(
                              (m) =>
                                m.name ===
                                (coffee.defaultMilk === "semi-skimmed"
                                  ? "Semi-Skimmed"
                                  : coffee.defaultMilk === "whole"
                                  ? "Whole Milk"
                                  : "Semi-Skimmed")
                            ) || milkTypes[2]
                          );
                          setShowMilkSelector(true);
                        }}
                      >
                        <Icon
                          name={coffee.icon}
                          type="material"
                          color={theme.primary}
                          size={28}
                        />
                        <View style={styles.coffeeInfo}>
                          <Text style={styles.coffeeName}>{coffee.name}</Text>
                          <Text style={styles.volumeInfo}>
                            {coffee.volume}mL
                          </Text>
                          <Text style={styles.caffeineContent}>
                            {coffee.caffeine}mg caffeine + milk
                          </Text>
                        </View>
                        <Icon
                          name="arrow-forward-ios"
                          color={theme.textLight}
                          size={16}
                        />
                      </TouchableOpacity>
                    ))}
                </>
              ) : (
                // Milk Selection - also needs scrolling
                <>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                      setSelectedCoffee(null);
                      setShowMilkSelector(false);
                    }}
                  >
                    <Icon
                      name="arrow-back-ios"
                      color={theme.primary}
                      size={20}
                    />
                    <Text style={styles.backText}>Back to drinks</Text>
                  </TouchableOpacity>

                  <Text style={styles.modalTitle}>Choose your milk</Text>
                  <Text style={styles.modalSubtitle}>
                    Milk affects caffeine absorption - fats and proteins slow it
                    down
                  </Text>

                  <View style={styles.selectedCoffeeInfo}>
                    <Text style={styles.selectedCoffeeName}>
                      {selectedCoffee.name}
                    </Text>
                    <Text style={styles.selectedCoffeeDetails}>
                      {selectedCoffee.volume}mL • {selectedCoffee.caffeine}mg
                      base caffeine
                    </Text>
                  </View>

                  {milkTypes.map((milk) => {
                    const effectiveCaffeine =
                      selectedCoffee.caffeine * (1 - milk.caffeineReduction);
                    const absorptionTime = 45 + milk.peakDelay;

                    return (
                      <TouchableOpacity
                        key={milk.name}
                        style={[
                          styles.milkOption,
                          selectedMilk?.name === milk.name &&
                            styles.selectedMilkOption,
                        ]}
                        onPress={() => setSelectedMilk(milk)}
                      >
                        <View style={styles.milkInfo}>
                          <Text style={styles.milkName}>{milk.name}</Text>
                          <Text style={styles.milkEffects}>
                            {Math.round(effectiveCaffeine)}mg effective • Peak
                            in {absorptionTime}min
                          </Text>
                          {milk.caffeineReduction > 0 && (
                            <Text style={styles.milkReduction}>
                              {Math.round(milk.caffeineReduction * 100)}% slower
                              absorption
                            </Text>
                          )}
                        </View>
                        {selectedMilk?.name === milk.name && (
                          <Icon name="check-circle" color="#4CAF50" size={24} />
                        )}
                      </TouchableOpacity>
                    );
                  })}

                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => addCoffeeEntry(selectedCoffee, selectedMilk)}
                  >
                    <Text style={styles.confirmButtonText}>
                      Log {selectedCoffee.name} with {selectedMilk.name}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={styles.cancelButtonStreamlined}
                onPress={() => {
                  setShowCoffeeModal(false);
                  setSelectedCoffee(null);
                  setShowMilkSelector(false);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Subtle Toast Notification */}
      {showToast && (
        <Animated.View
          style={[styles.toastNotification, { opacity: fadeAnim }]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* IMPROVED Coffee Selection Modal with Preview */}
      <Modal
        visible={showCoffeeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCoffeeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What did you drink?</Text>
            <Text style={styles.modalSubtitle}>
              Your coffee will appear as an orange arc on the clock
            </Text>

            {coffeeTypes.map((coffee) => (
              <TouchableOpacity
                key={coffee.name}
                style={styles.coffeeOptionImproved}
                onPress={() => addCoffeeEntry(coffee)}
              >
                <Icon
                  name={coffee.icon}
                  type="material"
                  color={theme.primary}
                  size={28}
                />
                <View style={styles.coffeeInfo}>
                  <Text style={styles.coffeeName}>{coffee.name}</Text>
                  <Text style={styles.caffeineContent}>
                    {coffee.caffeine}mg caffeine
                  </Text>
                  <Text style={styles.coffeePreview}>
                    Will show 12-hour decay arc on clock
                  </Text>
                </View>
                <View style={styles.addIndicator}>
                  <Icon name="add-circle" color="#4CAF50" size={24} />
                </View>
              </TouchableOpacity>
            ))}

            <Button
              title="Cancel"
              onPress={() => setShowCoffeeModal(false)}
              buttonStyle={styles.cancelButton}
            />
          </View>
        </View>
      </Modal>

      {/* Wake-up Time Settings Modal */}
      <Modal
        visible={showWakeUpSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWakeUpSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adjust Wake-up Time</Text>
            <Text style={styles.currentWakeUpText}>
              Current:{" "}
              {wakeUpTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>

            <View style={styles.adjustmentButtons}>
              <TouchableOpacity
                style={styles.timeAdjustButton}
                onPress={() => adjustWakeUpTime(-1)}
              >
                <Text style={styles.adjustButtonText}>-1 Hour</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeAdjustButton}
                onPress={() => adjustWakeUpTime(-0.5)}
              >
                <Text style={styles.adjustButtonText}>-30 Min</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeAdjustButton}
                onPress={() => adjustWakeUpTime(0.5)}
              >
                <Text style={styles.adjustButtonText}>+30 Min</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeAdjustButton}
                onPress={() => adjustWakeUpTime(1)}
              >
                <Text style={styles.adjustButtonText}>+1 Hour</Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Done"
              onPress={() => setShowWakeUpSettings(false)}
              buttonStyle={[
                styles.cancelButton,
                { backgroundColor: theme.primary },
              ]}
              titleStyle={{ color: "white" }}
            />
          </View>
        </View>
      </Modal>

      {/* REMOVE THE ENTIRE CUSTOM BOTTOM BAR FROM HERE */}
      {/* It should be handled by React Navigation instead */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.text,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 2,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 18,
  },
  activeToggle: {
    backgroundColor: theme.primary,
  },
  clockContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  clockFace: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderRadius: CLOCK_SIZE / 2,
    backgroundColor: "white",
  },
  centerDisplay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -40 }, { translateY: 10 }],
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  caffeineAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.primary,
    lineHeight: 28,
  },
  caffeineUnit: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.primary,
    marginTop: -5,
  },
  caffeineLabel: {
    fontSize: 10,
    color: theme.textLight,
    letterSpacing: 1,
    marginTop: 2,
  },
  digitalTime: {
    position: "absolute",
    top: "30%",
    left: "50%",
    transform: [{ translateX: -35 }, { translateY: -10 }],
    backgroundColor: "rgba(139, 69, 19, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  wakeUpDisplay: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "rgba(76, 205, 196, 0.15)",
    borderRadius: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: theme.cortisol + "40",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wakeUpText: {
    fontSize: 13,
    color: theme.cortisol,
    fontWeight: "600",
    flex: 1,
  },
  adjustButton: {
    padding: 4,
  },
  dailyStats: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(139, 69, 19, 0.1)",
    borderRadius: 15,
    marginHorizontal: 20,
  },
  statsText: {
    fontSize: 14,
    color: theme.primary,
    textAlign: "center",
    fontWeight: "500",
  },
  currentWakeUpText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: theme.primary,
    fontWeight: "600",
  },
  adjustmentButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  timeAdjustButton: {
    backgroundColor: theme.surface,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 5,
  },
  adjustButtonText: {
    color: theme.primary,
    fontWeight: "600",
  },
  timeline: {
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  timelineHour: {
    alignItems: "center",
    marginHorizontal: 8,
    width: 60,
  },
  caffeineBar: {
    width: 80,
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  caffeineLevel: {
    width: "100%",
    borderRadius: 10,
    minHeight: 2,
  },
  hourLabel: {
    fontSize: 12,
    color: theme.textLight,
    marginBottom: 2,
  },
  currentHourLabel: {
    color: theme.primary,
    fontWeight: "bold",
  },
  statusContainer: {
    paddingHorizontal: 20,
  },
  statusCard: {
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
    color: theme.text,
  },
  statusText: {
    color: theme.textLight,
    lineHeight: 22,
    fontSize: 15,
  },
  statusCardText: {
    color: theme.textLight,
    lineHeight: 22,
    fontSize: 15,
  },
  warningText: {
    color: "#E74C3C",
    marginTop: 5,
    fontWeight: "500",
  },
  logCard: {
    margin: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: theme.text,
  },
  emptyLog: {
    textAlign: "center",
    color: theme.textLight,
    fontStyle: "italic",
    padding: 20,
  },
  logItem: {
    paddingVertical: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.primary,
    margin: 20,
    padding: 18,
    borderRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  addButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: theme.text,
  },
  coffeeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    backgroundColor: theme.surface,
    marginBottom: 10,
  },
  coffeeInfo: {
    marginLeft: 15,
    flex: 1,
  },
  coffeeName: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.text,
  },
  caffeineContent: {
    fontSize: 14,
    color: theme.textLight,
  },
  cancelButton: {
    backgroundColor: theme.textLight,
    marginTop: 10,
    borderRadius: 25,
  },
  enhancedLegend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
    paddingHorizontal: 30,
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  enhancedLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  enhancedLegendText: {
    fontSize: 13,
    color: theme.text,
    fontWeight: "500",
  },
  halfLifeStats: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    borderRadius: 15,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: theme.caffeine + "40",
  },
  halfLifeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.caffeine,
    textAlign: "center",
    marginBottom: 5,
  },
  halfLifeText: {
    fontSize: 13,
    color: theme.caffeine,
    textAlign: "center",
    lineHeight: 18,
  },
  coffeeList: {
    marginHorizontal: 20,
    marginTop: 15,
  },
  coffeeEntry: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  coffeeTime: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.primary,
    flex: 1,
  },
  coffeeType: {
    fontSize: 14,
    color: theme.text,
    flex: 2,
  },
  coffeeLevels: {
    fontSize: 12,
    color: theme.caffeine,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  simpleLegend: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "rgba(139, 69, 19, 0.05)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.primary + "20",
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.primary,
    marginBottom: 8,
  },
  legendExplain: {
    fontSize: 12,
    color: theme.textLight,
    lineHeight: 16,
  },
  modernClockFace: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderRadius: CLOCK_SIZE / 2,
    backgroundColor: "white",
    marginBottom: 20,
  },

  clockNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: "#F0F0F0",
  },

  // Add smaller container for 24-hour numbers
  clockNumber24: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
  },

  clockNumberText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  // Fix the duplicate clockNumber24Text - remove the duplicate one
  clockNumber24Text: {
    fontSize: 12, // Much smaller text to fit all 24 numbers
    fontWeight: "600",
    color: "#333",
  },

  modernCenterDisplay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderWidth: 2,
    borderColor: "#FF6B35",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  modernCaffeineAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF6B35",
    lineHeight: 36,
  },

  modernCaffeineUnit: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },

  caffeineBarFill: {
    height: "100%",
    backgroundColor: "#FF6B35",
    borderRadius: 3,
  },

  modernDigitalTime: {
    position: "absolute",
    top: 20,
    backgroundColor: "rgba(139, 69, 19, 0.9)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },

  modernTimeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },

  halfLifeLegend: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B35",
  },

  halfLifeLegendTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 12,
  },

  halfLifeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  halfLifeColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },

  halfLifeItemText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },

  scienceZones: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginBottom: 20,
  },

  scienceZone: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  zoneIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },

  zoneText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },

  logoContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 120,
    height: 120,
  },

  logoImageContainer: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: "#FF6B35",
  },

  logoImage: {
    width: 60,
    height: 60,
  },

  logoOverlay: {
    position: "absolute",
    bottom: -15,
    backgroundColor: "rgba(255, 107, 53, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    alignItems: "center",
    minWidth: 60,
  },

  logoOverlayCaffeine: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    lineHeight: 18,
  },

  logoOverlayUnit: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
    marginTop: -2,
  },

  progressRing: {
    position: "absolute",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  hourToggle: {
    flexDirection: "row",
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 2,
  },

  hourToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },

  activeHourToggle: {
    backgroundColor: theme.accent,
  },

  hourToggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.textLight,
  },

  activeHourToggleText: {
    color: "white",
  },

  // NEW FIXED STYLES FOR 12hr/24hr TOGGLE
  hourToggleFixed: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 18,
    padding: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  hourToggleButtonFixed: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 15,
    minWidth: 50,
    alignItems: "center",
  },

  activeHourToggleFixed: {
    backgroundColor: theme.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  hourToggleTextFixed: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },

  activeHourToggleTextFixed: {
    color: "white",
    fontWeight: "bold",
  },

  // REPLACE OLD HEADER STYLES WITH NEW ONES
  headerRedesigned: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8ED",
  },

  viewToggleRedesigned: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    borderRadius: 25,
    padding: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  toggleButtonRedesigned: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 21,
  },

  activeToggleRedesigned: {
    backgroundColor: theme.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  toggleLabelText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.textLight,
    marginLeft: 6,
  },

  activeToggleLabelText: {
    color: "white",
  },

  hourToggleRedesigned: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    borderRadius: 25,
    padding: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  hourButtonRedesigned: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 21,
    minWidth: 60,
    alignItems: "center",
  },

  activeHourButtonRedesigned: {
    backgroundColor: theme.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  hourTextRedesigned: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.textLight,
  },

  activeHourTextRedesigned: {
    color: "white",
    fontWeight: "bold",
  },

  // SMALLER CENTER DISPLAY
  smallerCenterDisplay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#FF6B35",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  smallerCaffeineAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B35",
    lineHeight: 22,
  },

  smallerCaffeineUnit: {
    fontSize: 10,
    fontWeight: "600",
    color: "#666",
  },

  improvedLegend: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B35",
  },

  legendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  legendItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },

  legendText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },

  sleepWarning: {
    fontSize: 12,
    color: "#FF4444",
    fontWeight: "600",
  },

  legendExplanation: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },

  explanationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },

  explanationText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    lineHeight: 16,
  },

  // Fix the duplicate legendDot error
  halfLifeColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },

  // Remove the duplicate halfLifeColorDot and replace with this:
  halfLifeColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },

  // Remove the duplicate legendDot and add new styles
  coffeeOptionImproved: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 12,
    backgroundColor: theme.surface,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  addIndicator: {
    marginLeft: 10,
  },

  coffeePreview: {
    fontSize: 11,
    color: "#4CAF50",
    fontStyle: "italic",
    marginTop: 2,
  },

  modalSubtitle: {
    fontSize: 14,
    color: theme.textLight,
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },

  // Add immediate feedback styles
  successToast: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    zIndex: 1000,
    elevation: 10,
  },

  successToastText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },

  // STREAMLINED STYLES
  floatingAddButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  streamlinedModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "70%",
  },

  streamlinedCoffeeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },

  cancelButtonStreamlined: {
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },

  cancelText: {
    color: theme.textLight,
    fontSize: 16,
    fontWeight: "500",
  },

  toastNotification: {
    position: "absolute",
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
    elevation: 10,
  },

  toastText: {
    color: "white",
    textAlign: "center",
    fontWeight: "500",
    fontSize: 14,
  },

  // Add new styles for enhanced coffee selection
  enhancedModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    margin: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "85%", // Slightly smaller to ensure it fits
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.primary,
    marginTop: 20,
    marginBottom: 12,
  },

  coffeeOptionEnhanced: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  volumeInfo: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },

  selectedCoffeeInfo: {
    backgroundColor: "#F0F8FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.primary + "30",
  },

  selectedCoffeeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.primary,
  },

  selectedCoffeeDetails: {
    fontSize: 14,
    color: theme.textLight,
    marginTop: 4,
  },

  milkOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  selectedMilkOption: {
    backgroundColor: "#E8F5E8",
    borderColor: "#4CAF50",
  },

  milkInfo: {
    flex: 1,
  },

  milkName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },

  milkEffects: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  milkReduction: {
    fontSize: 11,
    color: "#FF9800",
    fontStyle: "italic",
    marginTop: 2,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  backText: {
    fontSize: 16,
    color: theme.primary,
    marginLeft: 4,
  },

  confirmButton: {
    backgroundColor: theme.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },

  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Keep only ONE legendDot (remove the duplicate)
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },

  // Rename the duplicate halfLifeColorDot to avoid conflict
  halfLifeColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },

  // NEW IMPROVED STYLES FOR CLEARER DISPLAY
  improvedHalfLifeLegend: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  improvedLegendTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 8,
    textAlign: "center",
  },

  legendSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },

  noCoffeePlaceholder: {
    alignItems: "center",
    paddingVertical: 30,
  },

  noCoffeeText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },

  noCoffeeSubtext: {
    fontSize: 14,
    color: "#BBB",
    marginTop: 4,
  },

  coffeeCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  coffeeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  coffeeCardLeft: {
    flex: 1,
  },

  coffeeCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },

  coffeeCardDetails: {
    fontSize: 12,
    color: "#666",
  },

  coffeeCardRight: {
    alignItems: "flex-end",
  },

  currentCaffeineLevel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B35",
  },

  phaseIndicator: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  coffeeCardProgress: {
    marginBottom: 12,
  },

  progressBarContainer: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    marginBottom: 6,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: 3,
  },

  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },

  coffeeCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  timestampText: {
    fontSize: 12,
    color: "#999",
  },

  halfLifeText: {
    fontSize: 12,
    color: "#FF9800",
    fontWeight: "500",
  },

  totalSummaryCard: {
    backgroundColor: "#F0F8FF",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF6B35",
  },

  totalSummaryTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },

  totalSummaryAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF6B35",
  },

  totalSummarySubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },

  improvedScienceZones: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  scienceZonesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },

  scienceZoneCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  zoneCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  zoneIndicatorLarge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },

  zoneCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  zoneCardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },

  zoneCardTime: {
    fontSize: 13,
    color: "#999",
    fontWeight: "500",
  },

  // NEW PEAK INDICATOR STYLES FOR TIMELINE
  peakIndicator: {
    position: "absolute",
    alignItems: "center",
    zIndex: 10,
  },

  peakDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4444",
    borderWidth: 2,
    borderColor: "white",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },

  peakAmount: {
    fontSize: 8,
    color: "#FF4444",
    fontWeight: "bold",
    marginTop: 2,
    backgroundColor: "white",
    paddingHorizontal: 2,
    borderRadius: 2,
    elevation: 1,
  },

  peakTimeText: {
    fontSize: 10,
    color: "#FF4444",
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },

  halfLifeTextUnique: {
    fontSize: 12,
    color: "#FF9800",
    fontWeight: "500",
  },

  // TIMELINE STYLES - completely new design
  timelineContainer: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },

  timelineHeaderRefined: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8ED",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  timelineTitleRefined: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },

  currentStatusRefined: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  currentTimeRefined: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FF6B35",
  },

  currentCaffeineRefined: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FF6B35",
  },

  timelineRefined: {
    flex: 1,
    backgroundColor: "white",
  },

  timelineContentRefined: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  // CONSISTENT SIZING with clock elements
  timelineHourRefined: {
    width: 80, // Much smaller, consistent with clock
    marginRight: 8,
    position: "relative",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 8,
    minHeight: 100, // Smaller height
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  currentTimelineHourRefined: {
    backgroundColor: "#FFF8F0",
    borderWidth: 2,
    borderColor: "#FF6B35",
    elevation: 2,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  pastTimelineHourRefined: {
    opacity: 0.7,
  },

  hourLabelRefined: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
    marginBottom: 6,
  },

  currentHourLabelRefined: {
    color: "#FF6B35",
    fontWeight: "bold",
  },

  currentTimeIndicatorRefined: {
    position: "absolute",
    top: 24,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  currentMinutesRefined: {
    fontSize: 10,
    fontWeight: "bold",
    backgroundColor: "#FF6B35",
    color: "white",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },

  // REFINED CAFFEINE VISUALIZATION
  caffeineVisualizationRefined: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 60,
    marginBottom: 6,
  },

  caffeineBarRefined: {
    width: 16,
    backgroundColor: "#FFE0B2",
    borderRadius: 8,
    minHeight: 2,
  },

  caffeineAmountRefined: {
    fontSize: 9,
    color: "#FF6B35",
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },

  // REFINED EVENT INDICATORS
  coffeeEventRefined: {
    position: "absolute",
    top: 40,
    alignItems: "center",
    zIndex: 3,
  },

  coffeeIconRefined: {
    backgroundColor: "#8B4513",
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: "white",
  },

  coffeeEmojiRefined: {
    fontSize: 12,
    color: "white",
  },

  coffeeTimeRefined: {
    fontSize: 8,
    color: "#2C3E50",
    fontWeight: "500",
    marginTop: 2,
    textAlign: "center",
  },

  peakEventRefined: {
    position: "absolute",
    top: 65,
    alignItems: "center",
    zIndex: 3,
  },

  peakIconRefined: {
    backgroundColor: "#FFC107",
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: "white",
  },

  peakEmojiRefined: {
    fontSize: 10,
    color: "white",
  },

  peakTimeRefined: {
    fontSize: 7,
    color: "#FF9800",
    fontWeight: "500",
    marginTop: 1,
    textAlign: "center",
  },

  // REFINED SCIENCE WINDOWS
  scienceWindowRefined: {
    position: "absolute",
    bottom: 4,
    left: 4,
    right: 4,
    padding: 3,
    borderRadius: 6,
    alignItems: "center",
  },

  cortisolWindowRefined: {
    backgroundColor: "rgba(0, 150, 136, 0.2)",
    borderWidth: 1,
    borderColor: "#009688",
  },

  sleepWindowRefined: {
    backgroundColor: "rgba(156, 39, 176, 0.2)",
    borderWidth: 1,
    borderColor: "#9C27B0",
  },

  windowTextRefined: {
    fontSize: 10,
    fontWeight: "500",
  },

  // REFINED LEGEND
  timelineLegendRefined: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E1E8ED",
  },

  legendRowRefined: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  legendItemRefined: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendIconRefined: {
    fontSize: 14,
    marginRight: 4,
  },

  legendTextRefined: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },

  predictiveIndicatorRefined: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 107, 53, 0.3)",
    marginRight: 4,
  },

  // Remove all duplicate styles and keep only unique ones
  // Fix the linter errors by removing duplicate style definitions

  // Keep only essential styles without duplicates
  halfLifeColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF6B35",
  },

  // ... rest of existing unique styles ...

  halfLifeItemContent: {
    flex: 1,
    marginLeft: 8,
  },

  absorptionProgressContainer: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },

  absorptionProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#FFE0D6",
    borderRadius: 2,
    marginRight: 8,
    overflow: "hidden",
  },

  absorptionProgressFill: {
    height: "100%",
    borderRadius: 2,
  },

  absorptionPercentageText: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "500",
    minWidth: 60,
  },

  logEntryWithRemove: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  logEntryContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  logEntryDetails: {
    flex: 1,
    marginLeft: 12,
  },

  logEntryType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  logEntryTime: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  simpleRemoveButton: {
    padding: 8,
    borderRadius: 15,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
  },

  logTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },

  emptyLogText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 10,
  },

  modalScrollView: {
    flex: 1,
    width: "100%",
  },

  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  enhancedModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    margin: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "85%", // Slightly smaller to ensure it fits
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
});

export default HomeScreen;
