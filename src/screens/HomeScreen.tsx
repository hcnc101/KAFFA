import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  Alert,
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const addCoffeeEntry = (coffeeType: any) => {
    const now = new Date();
    const peakTime = new Date(now.getTime() + 45 * 60000); // Peak at 45 minutes
    const halfLifeTime = new Date(now.getTime() + 5.5 * 60 * 60000); // Half-life at 5.5 hours

    const entry: CoffeeEntry = {
      id: Math.random().toString(),
      type: coffeeType.name,
      caffeine: coffeeType.caffeine,
      timestamp: now,
      peakTime,
      halfLifeTime,
    };

    setCoffeeEntries([...coffeeEntries, entry]);
    setShowCoffeeModal(false);
  };

  const getCurrentCaffeineLevel = () => {
    const now = currentTime.getTime();
    return coffeeEntries.reduce((total, entry) => {
      const timeElapsed = (now - entry.timestamp.getTime()) / (1000 * 60 * 60); // Hours
      if (timeElapsed < 0) return total;

      // Caffeine absorption and decay model
      let currentLevel;
      if (timeElapsed <= 0.75) {
        // Absorption phase (0-45 minutes)
        currentLevel = entry.caffeine * (timeElapsed / 0.75);
      } else {
        // Decay phase (half-life of 5.5 hours)
        const decayTime = timeElapsed - 0.75;
        currentLevel = entry.caffeine * Math.pow(0.5, decayTime / 5.5);
      }

      return total + currentLevel;
    }, 0);
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
    const maxCaffeine = 400; // FDA recommended daily limit

    // Calculate caffeine level as percentage of max safe amount
    const caffeinePercentage = Math.min(currentCaffeine / maxCaffeine, 1);
    const caffeineAngle = caffeinePercentage * 360;

    // Helper function to convert time to angle
    const timeToAngle = (hours: number, minutes: number = 0) => {
      return (hours % 12) * 30 + minutes * 0.5 - 90;
    };

    // Helper function to create arc path
    const createArcPath = (
      startAngle: number,
      endAngle: number,
      radius: number
    ) => {
      const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
      const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
      const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
      const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

      return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
    };

    return (
      <View style={styles.clockContainer}>
        <Svg width={CLOCK_SIZE} height={CLOCK_SIZE}>
          {/* Background circle */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={CLOCK_RADIUS}
            fill="none"
            stroke={theme.surface}
            strokeWidth="2"
          />

          {/* Cortisol Window (90 minutes after wake up) */}
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
                d={createArcPath(startAngle, endAngle, CLOCK_RADIUS - 10)}
                fill="none"
                stroke={theme.cortisol}
                strokeWidth="12"
                strokeOpacity="0.7"
                strokeLinecap="round"
              />
            );
          })()}

          {/* Sleep Impact Window (6 hours before bedtime) */}
          {(() => {
            const bedHour = bedTime.getHours();
            const bedMinute = bedTime.getMinutes();
            const startHour = Math.floor((bedHour * 60 + bedMinute - 360) / 60);
            const startMinute = bedMinute;

            const startAngle = timeToAngle(
              startHour >= 0 ? startHour : startHour + 24,
              startMinute
            );
            const endAngle = timeToAngle(bedHour, bedMinute);

            return (
              <Path
                d={createArcPath(startAngle, endAngle, CLOCK_RADIUS - 10)}
                fill="none"
                stroke={theme.sleep}
                strokeWidth="12"
                strokeOpacity="0.7"
                strokeLinecap="round"
              />
            );
          })()}

          {/* Hour markers */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = i * 30 - 90;
            const x1 =
              centerX + (CLOCK_RADIUS - 20) * Math.cos((angle * Math.PI) / 180);
            const y1 =
              centerY + (CLOCK_RADIUS - 20) * Math.sin((angle * Math.PI) / 180);
            const x2 =
              centerX + (CLOCK_RADIUS - 5) * Math.cos((angle * Math.PI) / 180);
            const y2 =
              centerY + (CLOCK_RADIUS - 5) * Math.sin((angle * Math.PI) / 180);

            return (
              <Line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={theme.text}
                strokeWidth="2"
              />
            );
          })}

          {/* Hour numbers */}
          {Array.from({ length: 12 }, (_, i) => {
            const hour = i === 0 ? 12 : i;
            const angle = i * 30 - 90;
            const numberRadius = CLOCK_RADIUS - 30;
            const x =
              centerX + numberRadius * Math.cos((angle * Math.PI) / 180);
            const y =
              centerY + numberRadius * Math.sin((angle * Math.PI) / 180);

            return (
              <SvgText
                key={`hour-${i}`}
                x={x}
                y={y + 5}
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill={theme.text}
              >
                {hour}
              </SvgText>
            );
          })}

          {/* Caffeine level arc (innermost) */}
          {currentCaffeine > 0 && (
            <Path
              d={createArcPath(-90, -90 + caffeineAngle, CLOCK_RADIUS - 35)}
              fill="none"
              stroke={theme.caffeine}
              strokeWidth="8"
              strokeLinecap="round"
            />
          )}

          {/* Clock hands */}
          {(() => {
            const hours = currentTime.getHours();
            const minutes = currentTime.getMinutes();

            // Hour hand
            const hourAngle = (hours % 12) * 30 + minutes * 0.5 - 90;
            const hourX =
              centerX +
              (CLOCK_RADIUS - 70) * Math.cos((hourAngle * Math.PI) / 180);
            const hourY =
              centerY +
              (CLOCK_RADIUS - 70) * Math.sin((hourAngle * Math.PI) / 180);

            // Minute hand
            const minuteAngle = minutes * 6 - 90;
            const minuteX =
              centerX +
              (CLOCK_RADIUS - 50) * Math.cos((minuteAngle * Math.PI) / 180);
            const minuteY =
              centerY +
              (CLOCK_RADIUS - 50) * Math.sin((minuteAngle * Math.PI) / 180);

            return (
              <G>
                {/* Hour hand */}
                <Line
                  x1={centerX}
                  y1={centerY}
                  x2={hourX}
                  y2={hourY}
                  stroke={theme.primary}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Minute hand */}
                <Line
                  x1={centerX}
                  y1={centerY}
                  x2={minuteX}
                  y2={minuteY}
                  stroke={theme.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Center dot */}
                <Circle cx={centerX} cy={centerY} r="4" fill={theme.primary} />
              </G>
            );
          })()}

          {/* Center caffeine level display */}
          <SvgText
            x={centerX}
            y={centerY + 35}
            textAnchor="middle"
            fontSize="18"
            fontWeight="bold"
            fill={theme.text}
          >
            {Math.round(currentCaffeine)}mg
          </SvgText>
          <SvgText
            x={centerX}
            y={centerY + 50}
            textAnchor="middle"
            fontSize="10"
            fill={theme.textLight}
          >
            CAFFEINE
          </SvgText>

          {/* Digital time display */}
          <SvgText
            x={centerX}
            y={centerY - 35}
            textAnchor="middle"
            fontSize="14"
            fontWeight="500"
            fill={theme.text}
          >
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </SvgText>
        </Svg>

        {/* Legend */}
        <View style={styles.clockLegend}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: theme.cortisol }]}
            />
            <Text style={styles.legendText}>Cortisol Peak</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: theme.sleep }]}
            />
            <Text style={styles.legendText}>Sleep Impact</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: theme.caffeine }]}
            />
            <Text style={styles.legendText}>Caffeine Level</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTimelineView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const currentHour = currentTime.getHours();

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.timeline}
      >
        {hours.map((hour) => {
          const hourTime = new Date();
          hourTime.setHours(hour, 0, 0, 0);

          // Calculate caffeine level at this hour
          const caffeineAtHour = coffeeEntries.reduce((total, entry) => {
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
        {/* Cortisol Warning */}
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

        {/* Sleep Impact Warning */}
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

        {/* Current Caffeine Status */}
        <Card containerStyle={styles.statusCard}>
          <Text style={styles.statusTitle}>Current Caffeine Level</Text>
          <Text style={styles.caffeineLevel}>
            {Math.round(getCurrentCaffeineLevel())}mg / 400mg daily limit
          </Text>
          {getCurrentCaffeineLevel() > 300 && (
            <Text style={styles.warningText}>⚠️ Approaching daily limit</Text>
          )}
        </Card>
      </View>

      {/* Coffee Log */}
      <Card containerStyle={styles.logCard}>
        <Text style={styles.sectionTitle}>Today's Coffee Log</Text>
        {coffeeEntries.length === 0 ? (
          <Text style={styles.emptyLog}>No coffee logged today</Text>
        ) : (
          coffeeEntries.map((entry) => (
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
  caffeineAmount: {
    fontSize: 10,
    color: theme.text,
  },
  statusContainer: {
    paddingHorizontal: 20,
  },
  statusCard: {
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: theme.text,
  },
  statusText: {
    color: theme.textLight,
    lineHeight: 20,
  },
  warningText: {
    color: "#E74C3C",
    marginTop: 5,
    fontWeight: "500",
  },
  logCard: {
    margin: 20,
    borderRadius: 12,
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
    padding: 15,
    borderRadius: 25,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
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
  clockLegend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: theme.textLight,
  },
});

export default HomeScreen;
