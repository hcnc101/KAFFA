import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CoffeeEntry {
  id: string;
  type: string;
  volume: number; // mL
  caffeine: number;
  timestamp: Date;
  peakTime: Date;
  halfLifeTime: Date;
  dateKey: string;
  milkType?: string;
  effectiveCaffeine: number;
}

const COFFEE_ENTRIES_STORAGE_KEY = "@espressoo:coffee_entries";

// In-memory cache
let coffeeEntries: CoffeeEntry[] = [];

// Load coffee entries from storage
export const loadCoffeeEntries = async (): Promise<CoffeeEntry[]> => {
  try {
    const stored = await AsyncStorage.getItem(COFFEE_ENTRIES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      coffeeEntries = parsed.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
        peakTime: new Date(entry.peakTime),
        halfLifeTime: new Date(entry.halfLifeTime),
      }));
      console.log(
        "Loaded",
        coffeeEntries.length,
        "coffee entries from storage"
      );
    } else {
      console.log("No coffee entries found in storage");
      coffeeEntries = [];
    }
    return coffeeEntries;
  } catch (error) {
    console.error("Error loading coffee entries:", error);
    coffeeEntries = [];
    return [];
  }
};

// Save coffee entries to storage
export const saveCoffeeEntries = async (
  entries: CoffeeEntry[]
): Promise<void> => {
  try {
    coffeeEntries = entries;
    const serialized = JSON.stringify(entries);
    await AsyncStorage.setItem(COFFEE_ENTRIES_STORAGE_KEY, serialized);
    console.log("Saved", entries.length, "coffee entries to storage");
  } catch (error) {
    console.error("Error saving coffee entries:", error);
    throw error;
  }
};

// Add a new coffee entry
export const addCoffeeEntry = async (
  entry: CoffeeEntry
): Promise<CoffeeEntry> => {
  // Ensure we have the latest data loaded
  await loadCoffeeEntries();
  const updatedEntries = [entry, ...coffeeEntries];
  await saveCoffeeEntries(updatedEntries);
  console.log(
    "Coffee entry saved:",
    entry.type,
    "Total entries:",
    updatedEntries.length
  );
  return entry;
};

// Get all coffee entries
export const getAllCoffeeEntries = (): CoffeeEntry[] => {
  return [...coffeeEntries];
};

// Get coffee entries for a specific date
export const getCoffeeEntriesByDate = (dateKey: string): CoffeeEntry[] => {
  return coffeeEntries.filter((entry) => entry.dateKey === dateKey);
};

// Get coffee entries sorted by date (newest first)
export const getCoffeeEntriesSorted = (): CoffeeEntry[] => {
  return [...coffeeEntries].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
};

// Initialize on module load
loadCoffeeEntries().catch(console.error);
