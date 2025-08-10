import AsyncStorage from "@react-native-async-storage/async-storage";

export interface WidgetData {
  coffeeEntries: any[];
  lastUpdated: string;
  currentCaffeine: number;
  wakeUpTime: string;
  bedTime: string;
}

export class WidgetDataManager {
  static WIDGET_DATA_KEY = "coffee_clock_widget_data";

  static async updateWidgetData(data: Partial<WidgetData>) {
    try {
      const existingData = await this.getWidgetData();
      const updatedData = {
        ...existingData,
        ...data,
        lastUpdated: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        this.WIDGET_DATA_KEY,
        JSON.stringify(updatedData)
      );
      console.log("Widget data updated:", updatedData);
    } catch (error) {
      console.error("Failed to update widget data:", error);
    }
  }

  static async getWidgetData(): Promise<WidgetData> {
    try {
      const data = await AsyncStorage.getItem(this.WIDGET_DATA_KEY);
      return data
        ? JSON.parse(data)
        : {
            coffeeEntries: [],
            lastUpdated: new Date().toISOString(),
            currentCaffeine: 0,
            wakeUpTime: new Date().toISOString(),
            bedTime: new Date().toISOString(),
          };
    } catch (error) {
      console.error("Failed to get widget data:", error);
      return {
        coffeeEntries: [],
        lastUpdated: new Date().toISOString(),
        currentCaffeine: 0,
        wakeUpTime: new Date().toISOString(),
        bedTime: new Date().toISOString(),
      };
    }
  }

  static async clearWidgetData() {
    try {
      await AsyncStorage.removeItem(this.WIDGET_DATA_KEY);
    } catch (error) {
      console.error("Failed to clear widget data:", error);
    }
  }
}
