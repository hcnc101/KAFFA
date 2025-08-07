import React, { useState, useEffect } from "react";
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

// Coffee types with caffeine content (mg)
const coffeeTypes = [
  { name: "Espresso", caffeine: 75, icon: "local-cafe" },
  { name: "Coffee (8oz)", caffeine: 95, icon: "coffee" },
  { name: "Americano", caffeine: 150, icon: "coffee" },
  { name: "Cold Brew", caffeine: 200, icon: "ac-unit" },
  { name: "Tea", caffeine: 50, icon: "emoji-food-beverage" },
  { name: "Energy Drink", caffeine: 80, icon: "battery-charging-full" },
];

interface CoffeeEntry {
  id: string;
  type: string;
  caffeine: number;
  timestamp: Date;
  peakTime: Date;
  halfLifeTime: Date;
  dateKey: string;
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
        // App became active
        logActivity("app_active");

        // If it's been more than 4 hours since last activity, this might be wake-up
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
        // App went to background
        setLastInactiveTime(now);
      }

      setLastAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Log initial activity
    logActivity("app_active");

    return () => subscription?.remove();
  }, [lastAppState, todaysWakeUpDetected, activityLog, lastInactiveTime]);

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
  }, [currentDateKey]);

  useEffect(() => {
    checkForNewDay();
  }, []);

  const addCoffeeEntry = (coffeeType: any) => {
    const now = new Date();
    const peakTime = new Date(now.getTime() + 45 * 60000);
    const halfLifeTime = new Date(now.getTime() + 5.5 * 60 * 60000);

    const entry: CoffeeEntry = {
      id: Date.now().toString(),
      type: coffeeType.name,
      caffeine: coffeeType.caffeine,
      timestamp: now,
      peakTime,
      halfLifeTime,
      dateKey: getDateKey(now),
    };

    console.log("Adding coffee entry:", entry);
    setCoffeeEntries((prev) => [...prev, entry]);
    setShowCoffeeModal(false);

    // Log significant activity (coffee consumption)
    logActivity("significant_activity");

    setCurrentTime(new Date());
  };

  // Get today's coffee entries only
  const getTodaysCoffeeEntries = () => {
    const todayKey = getDateKey(currentTime);
    return coffeeEntries.filter((entry) => entry.dateKey === todayKey);
  };

  const getCurrentCaffeineLevel = () => {
    const now = currentTime.getTime();
    const todaysEntries = getTodaysCoffeeEntries();

    if (todaysEntries.length === 0) {
      return 0;
    }

    let totalCaffeine = 0;
    console.log("=== CAFFEINE CALCULATION DEBUG ===");

    todaysEntries.forEach((entry, index) => {
      const timeElapsed = (now - entry.timestamp.getTime()) / (1000 * 60 * 60); // Hours
      console.log(
        `Coffee ${index + 1}: ${entry.type} (${
          entry.caffeine
        }mg) - ${timeElapsed.toFixed(2)} hours ago`
      );

      if (timeElapsed < 0) {
        console.log("  -> Future entry, skipping");
        return;
      }

      if (timeElapsed > 24) {
        console.log("  -> Too old (>24h), skipping");
        return;
      }

      let currentLevel;
      if (timeElapsed <= 0.75) {
        // Absorption phase (0-45 minutes)
        currentLevel = entry.caffeine * (timeElapsed / 0.75);
        console.log(`  -> Absorption phase: ${currentLevel.toFixed(1)}mg`);
      } else {
        // Decay phase (half-life of 5.5 hours)
        const decayTime = timeElapsed - 0.75;
        currentLevel = entry.caffeine * Math.pow(0.5, decayTime / 5.5);
        console.log(
          `  -> Decay phase (${decayTime.toFixed(
            2
          )}h decay): ${currentLevel.toFixed(1)}mg`
        );
      }

      totalCaffeine += currentLevel;
      console.log(`  -> Running total: ${totalCaffeine.toFixed(1)}mg`);
    });

    console.log(`FINAL TOTAL: ${totalCaffeine.toFixed(1)}mg`);
    return totalCaffeine;
  };

  const getTodaysTotalCaffeine = () => {
    const todaysEntries = getTodaysCoffeeEntries();
    return todaysEntries.reduce((total, entry) => total + entry.caffeine, 0);
  };

  const getCortisolWindow = () => {
    const now = new Date();
    const wakeUpPlus90 = new Date(wakeUpTime.getTime() + 90 * 60000);
    const isInCortisolWindow = now >= wakeUpTime && now <= wakeUpPlus90;
    return { isInWindow: isInCortisolWindow, endTime: wakeUpPlus90 };
  };

  const getSleepImpactWindow = () => {
    const sixHoursBefore = new Date(bedTime.getTime() - 6 * 60 * 60000);
    const now = new Date();
    const isInSleepWindow = now >= sixHoursBefore && now <= bedTime;
    return { isInWindow: isInSleepWindow, startTime: sixHoursBefore };
  };

  const renderCoffeeClock = () => {
    const centerX = CLOCK_SIZE / 2;
    const centerY = CLOCK_SIZE / 2;
    const currentCaffeine = getCurrentCaffeineLevel();
    const maxCaffeine = 400;

    // Calculate caffeine level as percentage of max safe amount
    const caffeinePercentage = Math.min(currentCaffeine / maxCaffeine, 1);
    const caffeineAngle = caffeinePercentage * 360;

    console.log(
      `RENDERING: ${currentCaffeine.toFixed(
        1
      )}mg caffeine, ${caffeineAngle.toFixed(1)}° arc`
    );

    const timeToAngle = (hours: number, minutes: number = 0) => {
      return (hours % 12) * 30 + minutes * 0.5 - 90;
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
        <View style={styles.clockFace}>
          <Svg width={CLOCK_SIZE} height={CLOCK_SIZE}>
            {/* Background */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={CLOCK_RADIUS}
              fill="#FAFAFA"
              stroke="#E0E0E0"
              strokeWidth="3"
            />
            <Circle
              cx={centerX}
              cy={centerY}
              r={CLOCK_RADIUS - 15}
              fill="white"
              stroke="#F5F5F5"
              strokeWidth="1"
            />

            {/* CORTISOL WINDOW - Make it always visible for debugging */}
            {(() => {
              const wakeHour = wakeUpTime.getHours();
              const wakeMinute = wakeUpTime.getMinutes();
              const endHour =
                Math.floor((wakeHour * 60 + wakeMinute + 90) / 60) % 24;
              const endMinute = (wakeMinute + 90) % 60;

              const startAngle = timeToAngle(wakeHour, wakeMinute);
              const endAngle = timeToAngle(endHour, endMinute);

              console.log(
                `CORTISOL: Wake ${wakeHour}:${wakeMinute} -> ${endHour}:${endMinute} (${startAngle}° to ${endAngle}°)`
              );

              return (
                <Path
                  d={createArcPath(startAngle, endAngle, CLOCK_RADIUS - 8)}
                  fill="none"
                  stroke={theme.cortisol}
                  strokeWidth="20"
                  strokeOpacity="0.9"
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
              const startMinute = bedMinute;

              const startAngle = timeToAngle(
                startHour >= 0 ? startHour : startHour + 24,
                startMinute
              );
              const endAngle = timeToAngle(bedHour, bedMinute);

              return (
                <Path
                  d={createArcPath(startAngle, endAngle, CLOCK_RADIUS - 8)}
                  fill="none"
                  stroke={theme.sleep}
                  strokeWidth="20"
                  strokeOpacity="0.9"
                  strokeLinecap="round"
                />
              );
            })()}

            {/* INDIVIDUAL COFFEE HALF-LIFE ARCS - THE MAIN FEATURE! */}
            {getTodaysCoffeeEntries().map((entry, index) => {
              const now = currentTime.getTime();
              const timeElapsed =
                (now - entry.timestamp.getTime()) / (1000 * 60 * 60);

              if (timeElapsed < 0 || timeElapsed > 24) return null;

              // Calculate current level for this specific coffee
              let currentLevel;
              if (timeElapsed <= 0.75) {
                currentLevel = entry.caffeine * (timeElapsed / 0.75);
              } else {
                const decayTime = timeElapsed - 0.75;
                currentLevel = entry.caffeine * Math.pow(0.5, decayTime / 5.5);
              }

              // Show the entire half-life curve, not just remaining
              const totalHalfLifeHours = 12; // Show 12 hours of decay
              const maxAngle = 120; // Use more of the circle

              // Create a decay curve showing the full half-life
              const decayArcs = [];
              for (let hour = 0; hour <= totalHalfLifeHours; hour += 0.5) {
                if (hour < timeElapsed) continue; // Don't show past

                const futureDecayTime = hour - 0.75;
                let futureLevel;
                if (hour <= 0.75) {
                  futureLevel = entry.caffeine * (hour / 0.75);
                } else {
                  futureLevel =
                    entry.caffeine * Math.pow(0.5, futureDecayTime / 5.5);
                }

                const levelPercentage = futureLevel / entry.caffeine;
                const opacity = Math.max(0.2, levelPercentage);

                if (levelPercentage > 0.01) {
                  // Only show if significant
                  const hourAngle = (hour / totalHalfLifeHours) * maxAngle;
                  const radius = CLOCK_RADIUS - 40 - index * 12;

                  decayArcs.push(
                    <Circle
                      key={`decay-${entry.id}-${hour}`}
                      cx={
                        centerX +
                        radius * Math.cos(((hourAngle - 90) * Math.PI) / 180)
                      }
                      cy={
                        centerY +
                        radius * Math.sin(((hourAngle - 90) * Math.PI) / 180)
                      }
                      r="3"
                      fill={theme.caffeine}
                      opacity={opacity}
                    />
                  );
                }
              }

              return (
                <G key={`coffee-visualization-${entry.id}`}>
                  {decayArcs}
                  {/* Current level indicator */}
                  <Circle
                    cx={
                      centerX +
                      (CLOCK_RADIUS - 40 - index * 12) *
                        Math.cos(
                          (((timeElapsed / totalHalfLifeHours) * maxAngle -
                            90) *
                            Math.PI) /
                            180
                        )
                    }
                    cy={
                      centerY +
                      (CLOCK_RADIUS - 40 - index * 12) *
                        Math.sin(
                          (((timeElapsed / totalHalfLifeHours) * maxAngle -
                            90) *
                            Math.PI) /
                            180
                        )
                    }
                    r="6"
                    fill={theme.caffeine}
                    stroke="white"
                    strokeWidth="2"
                  />
                </G>
              );
            })}

            {/* Hour markers and numbers */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = i * 30 - 90;
              const hour = i === 0 ? 12 : i;
              const x =
                centerX +
                (CLOCK_RADIUS - 30) * Math.cos((angle * Math.PI) / 180);
              const y =
                centerY +
                (CLOCK_RADIUS - 30) * Math.sin((angle * Math.PI) / 180);

              return (
                <G key={i}>
                  <Circle
                    cx={x}
                    cy={y}
                    r="18"
                    fill="white"
                    stroke="#E0E0E0"
                    strokeWidth="1"
                    opacity="0.9"
                  />
                  <SvgText
                    x={x}
                    y={y + 6}
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="bold"
                    fill={theme.text}
                  >
                    {hour}
                  </SvgText>
                </G>
              );
            })}

            {/* MAIN CAFFEINE LEVEL ARC - Make it always visible */}
            <Path
              d={createArcPath(-90, -90 + caffeineAngle, CLOCK_RADIUS - 25)}
              fill="none"
              stroke={theme.caffeine}
              strokeWidth="15"
              strokeLinecap="round"
              opacity="1"
            />

            {/* Clock hands */}
            {(() => {
              const hours = currentTime.getHours();
              const minutes = currentTime.getMinutes();
              const hourAngle = (hours % 12) * 30 + minutes * 0.5 - 90;
              const minuteAngle = minutes * 6 - 90;

              return (
                <G>
                  <Line
                    x1={centerX}
                    y1={centerY}
                    x2={
                      centerX +
                      (CLOCK_RADIUS - 80) *
                        Math.cos((hourAngle * Math.PI) / 180)
                    }
                    y2={
                      centerY +
                      (CLOCK_RADIUS - 80) *
                        Math.sin((hourAngle * Math.PI) / 180)
                    }
                    stroke={theme.primary}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <Line
                    x1={centerX}
                    y1={centerY}
                    x2={
                      centerX +
                      (CLOCK_RADIUS - 60) *
                        Math.cos((minuteAngle * Math.PI) / 180)
                    }
                    y2={
                      centerY +
                      (CLOCK_RADIUS - 60) *
                        Math.sin((minuteAngle * Math.PI) / 180)
                    }
                    stroke={theme.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <Circle
                    cx={centerX}
                    cy={centerY}
                    r="6"
                    fill={theme.primary}
                  />
                </G>
              );
            })()}
          </Svg>

          {/* Center caffeine display - FIXED */}
          <View style={styles.centerDisplay}>
            <Text style={styles.caffeineAmount}>
              {Math.round(currentCaffeine)}
            </Text>
            <Text style={styles.caffeineUnit}>mg</Text>
            <Text style={styles.caffeineLabel}>CURRENT</Text>
          </View>

          {/* Digital time */}
          <View style={styles.digitalTime}>
            <Text style={styles.timeText}>
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>
          </View>
        </View>

        {/* Simplified stats - focus on half-life */}
        <View style={styles.halfLifeStats}>
          <Text style={styles.halfLifeTitle}>☕ Half-Life Tracker</Text>
          <Text style={styles.halfLifeText}>
            Each dot shows caffeine decay over 12 hours. Larger dots = more
            caffeine remaining.
          </Text>
        </View>

        {/* Coffee entries with half-life info */}
        <View style={styles.coffeeList}>
          {getTodaysCoffeeEntries().map((entry, index) => {
            const now = currentTime.getTime();
            const timeElapsed =
              (now - entry.timestamp.getTime()) / (1000 * 60 * 60);
            let currentLevel = 0;

            if (timeElapsed >= 0 && timeElapsed <= 24) {
              if (timeElapsed <= 0.75) {
                currentLevel = entry.caffeine * (timeElapsed / 0.75);
              } else {
                const decayTime = timeElapsed - 0.75;
                currentLevel = entry.caffeine * Math.pow(0.5, decayTime / 5.5);
              }
            }

            return (
              <View key={entry.id} style={styles.coffeeEntry}>
                <Text style={styles.coffeeTime}>
                  {entry.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Text style={styles.coffeeType}>{entry.type}</Text>
                <Text style={styles.coffeeLevels}>
                  {Math.round(currentLevel)}mg / {entry.caffeine}mg
                </Text>
              </View>
            );
          })}
        </View>

        {/* Simplified legend */}
        <View style={styles.simpleLegend}>
          <Text style={styles.legendTitle}>🧠 Coffee Science</Text>
          <Text style={styles.legendExplain}>
            • Teal: Don't drink coffee (cortisol peak){"\n"}• Purple: Affects
            sleep if consumed{"\n"}• Orange: Current caffeine + half-life decay
          </Text>
        </View>
      </View>
    );
  };

  const renderTimelineView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const currentHour = currentTime.getHours();
    const todaysEntries = getTodaysCoffeeEntries();

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.timeline}
      >
        {hours.map((hour) => {
          const hourTime = new Date();
          hourTime.setHours(hour, 0, 0, 0);

          const caffeineAtHour = todaysEntries.reduce((total, entry) => {
            const timeElapsed =
              (hourTime.getTime() - entry.timestamp.getTime()) /
              (1000 * 60 * 60);
            if (timeElapsed < 0 || timeElapsed > 12) return total;

            let level;
            if (timeElapsed <= 0.75) {
              level = entry.caffeine * (timeElapsed / 0.75);
            } else {
              level =
                entry.caffeine * Math.pow(0.5, (timeElapsed - 0.75) / 5.5);
            }
            return total + level;
          }, 0);

          const isCurrentHour = hour === currentHour;
          const maxHeight = 100;
          const caffeineHeight = Math.min(
            (caffeineAtHour / 300) * maxHeight,
            maxHeight
          );

          return (
            <View key={hour} style={styles.timelineHour}>
              <View style={styles.caffeineBar}>
                <View
                  style={[
                    styles.caffeineLevel,
                    {
                      height: caffeineHeight,
                      backgroundColor: isCurrentHour
                        ? theme.caffeine
                        : theme.secondary,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.hourLabel,
                  isCurrentHour && styles.currentHourLabel,
                ]}
              >
                {hour === 0
                  ? "12AM"
                  : hour <= 12
                  ? `${hour}AM`
                  : `${hour - 12}PM`}
              </Text>
              {caffeineAtHour > 0 && (
                <Text style={styles.caffeineAmount}>
                  {Math.round(caffeineAtHour)}mg
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const cortisolInfo = getCortisolWindow();
  const sleepInfo = getSleepImpactWindow();
  const todaysEntries = getTodaysCoffeeEntries();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Coffee Science Tracker</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            onPress={() => setShowClockView(true)}
            style={[styles.toggleButton, showClockView && styles.activeToggle]}
          >
            <Icon
              name="schedule"
              size={20}
              color={showClockView ? "white" : theme.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowClockView(false)}
            style={[styles.toggleButton, !showClockView && styles.activeToggle]}
          >
            <Icon
              name="timeline"
              size={20}
              color={!showClockView ? "white" : theme.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Display */}
      {showClockView ? renderCoffeeClock() : renderTimelineView()}

      {/* Status Cards */}
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
              Your natural alertness is high. Consider waiting until{" "}
              {cortisolInfo.endTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              for optimal coffee timing.
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
              Coffee consumed now may affect your sleep quality. Consider decaf
              or herbal tea.
            </Text>
          </Card>
        )}

        <Card containerStyle={styles.statusCard}>
          <Text style={styles.statusTitle}>Current Caffeine Level</Text>
          <Text style={styles.statusCardText}>
            {Math.round(getCurrentCaffeineLevel())}mg / 400mg daily limit
          </Text>
          {getCurrentCaffeineLevel() > 300 && (
            <Text style={styles.warningText}>⚠️ Approaching daily limit</Text>
          )}
          {getTodaysTotalCaffeine() > 400 && (
            <Text style={styles.warningText}>⚠️ Daily limit exceeded</Text>
          )}
        </Card>
      </View>

      {/* Coffee Log */}
      <Card containerStyle={styles.logCard}>
        <Text style={styles.sectionTitle}>Today's Coffee Log</Text>
        {todaysEntries.length === 0 ? (
          <Text style={styles.emptyLog}>No coffee logged today</Text>
        ) : (
          todaysEntries.map((entry) => (
            <ListItem key={entry.id} containerStyle={styles.logItem}>
              <Icon name="local-cafe" color={theme.primary} />
              <ListItem.Content>
                <ListItem.Title>{entry.type}</ListItem.Title>
                <ListItem.Subtitle>
                  {entry.caffeine}mg at{" "}
                  {entry.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          ))
        )}
      </Card>

      {/* Add Coffee Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowCoffeeModal(true)}
      >
        <Icon name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Log Coffee</Text>
      </TouchableOpacity>

      {/* Coffee Selection Modal */}
      <Modal
        visible={showCoffeeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCoffeeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What did you drink?</Text>
            {coffeeTypes.map((coffee) => (
              <TouchableOpacity
                key={coffee.name}
                style={styles.coffeeOption}
                onPress={() => addCoffeeEntry(coffee)}
              >
                <Icon
                  name={coffee.icon}
                  type="material"
                  color={theme.primary}
                />
                <View style={styles.coffeeInfo}>
                  <Text style={styles.coffeeName}>{coffee.name}</Text>
                  <Text style={styles.caffeineContent}>
                    {coffee.caffeine}mg caffeine
                  </Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
    height: 120,
    width: 20,
    backgroundColor: theme.surface,
    borderRadius: 10,
    justifyContent: "flex-end",
    marginBottom: 5,
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
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
});

export default HomeScreen;
