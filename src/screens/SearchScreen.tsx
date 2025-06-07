import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SearchBar, Text, Button, Chip } from "@rneui/themed";

const SearchScreen = () => {
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const filters = [
    "Light Roast",
    "Medium Roast",
    "Dark Roast",
    "Single Origin",
    "Blend",
    "Espresso",
  ];

  const toggleFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search coffees..."
        onChangeText={setSearch}
        value={search}
        platform="ios"
        containerStyle={styles.searchBar}
      />

      <Text style={styles.filterTitle}>Filters</Text>
      <ScrollView horizontal style={styles.filterContainer}>
        {filters.map((filter) => (
          <Chip
            key={filter}
            title={filter}
            type={selectedFilters.includes(filter) ? "solid" : "outline"}
            onPress={() => toggleFilter(filter)}
            containerStyle={styles.chip}
            buttonStyle={{
              backgroundColor: selectedFilters.includes(filter)
                ? "#6F4E37"
                : "white",
            }}
          />
        ))}
      </ScrollView>

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.noResults}>
          Enter a search term to discover new coffees!
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchBar: {
    backgroundColor: "transparent",
    borderBottomColor: "transparent",
    borderTopColor: "transparent",
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 15,
    marginTop: 10,
    color: "#6F4E37",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  chip: {
    marginHorizontal: 5,
  },
  resultsContainer: {
    flex: 1,
    padding: 15,
  },
  noResults: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});

export default SearchScreen;
