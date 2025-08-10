import React from "react";
import { View, Text } from "react-native";
import { Widget } from "react-native-widget-extension";

const CoffeeClockWidget = () => {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [caffeineLevel, setCaffeineLevel] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Calculate caffeine level from shared data
      // This would come from your main app
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <Widget size="medium">
      <View style={styles.container}>
        <Text style={styles.time}>
          {currentTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        <Text style={styles.caffeine}>{Math.round(caffeineLevel)}mg</Text>
        <Text style={styles.label}>Active Caffeine</Text>
      </View>
    </Widget>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  time: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B4513",
  },
  caffeine: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF6B35",
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
};

export default CoffeeClockWidget;
