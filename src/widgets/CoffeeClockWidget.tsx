import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Widget } from "react-native-widget-extension";

// Simplified version of your caffeine calculation
const calculateCaffeineLevel = (coffeeEntries: any[]) => {
  const now = new Date();
  let totalCaffeine = 0;

  coffeeEntries.forEach((entry) => {
    const timeElapsed =
      (now.getTime() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60);
    if (timeElapsed >= 0 && timeElapsed <= 12) {
      // Simplified calculation for widget
      if (timeElapsed <= 0.75) {
        // 45 minutes
        totalCaffeine += entry.effectiveCaffeine * (timeElapsed / 0.75);
      } else {
        const decayTime = timeElapsed - 0.75;
        totalCaffeine +=
          entry.effectiveCaffeine * Math.pow(0.5, decayTime / 5.5);
      }
    }
  });

  return totalCaffeine;
};

const CoffeeClockWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [caffeineLevel, setCaffeineLevel] = useState(0);
  const [coffeeCount, setCoffeeCount] = useState(0);

  useEffect(() => {
    // Update every minute (widgets have limited update frequency)
    const timer = setInterval(() => {
      setCurrentTime(new Date());

      // In a real implementation, you'd get this data from shared storage
      // For now, we'll use mock data
      const mockEntries = [
        {
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          effectiveCaffeine: 150,
        },
        {
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          effectiveCaffeine: 75,
        },
      ];

      setCaffeineLevel(calculateCaffeineLevel(mockEntries));
      setCoffeeCount(mockEntries.length);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Widget size="medium">
      <View style={styles.container}>
        {/* Time Display */}
        <Text style={styles.timeText}>
          {currentTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </Text>

        {/* Caffeine Level */}
        <Text style={styles.caffeineText}>{Math.round(caffeineLevel)}mg</Text>

        {/* Status */}
        <Text style={styles.statusText}>Active Caffeine</Text>

        {/* Coffee Count */}
        <Text style={styles.coffeeCountText}>☕ {coffeeCount} today</Text>
      </View>
    </Widget>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  timeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 4,
  },
  caffeineText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 2,
  },
  statusText: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 8,
  },
  coffeeCountText: {
    fontSize: 11,
    color: "#8B4513",
    fontWeight: "500",
  },
});

export default CoffeeClockWidget;
