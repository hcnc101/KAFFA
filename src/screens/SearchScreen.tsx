import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import { Text, Icon, Image, Button } from "@rneui/themed";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { coffeeShops } from "../data/coffeeShops";
import CoffeeShopCard from "../components/CoffeeShopCard";

const SCREEN_WIDTH = Dimensions.get("window").width;

const theme = {
  primary: "#8B4513",
  secondary: "#C4A484",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#333333",
  textLight: "#666666",
};

interface CoffeeShop {
  id: number;
  name: string;
  image: string;
  rating: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  distance?: string;
}

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [coffeeShops] = useState<CoffeeShop[]>([
    {
      id: 1,
      name: "Blue Bottle Coffee",
      image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8",
      rating: 4.8,
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: "300 Grant Ave, San Francisco, CA",
      },
    },
    {
      id: 2,
      name: "Sightglass Coffee",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
      rating: 4.6,
      location: {
        latitude: 37.7793,
        longitude: -122.4192,
        address: "270 7th Street, San Francisco, CA",
      },
    },
    {
      id: 3,
      name: "Ritual Coffee Roasters",
      image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8",
      rating: 4.7,
      location: {
        latitude: 37.7694,
        longitude: -122.4237,
        address: "1026 Valencia St, San Francisco, CA",
      },
    },
  ]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Icon name="search" type="material" size={24} color={theme.textLight} />
        <TextInput
          placeholder="Search coffees, roasters, or cafes..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.textLight}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Icon
              name="close"
              type="material"
              size={24}
              color={theme.textLight}
            />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={styles.mapToggle}
        onPress={() => setShowMap(!showMap)}
      >
        <Icon
          name={showMap ? "view-list" : "map"}
          type="material"
          size={24}
          color={theme.primary}
        />
      </TouchableOpacity>
    </View>
  );

  const renderMap = () => {
    if (!location) {
      return (
        <View style={styles.loadingContainer}>
          <Text>Loading map...</Text>
        </View>
      );
    }

    return (
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* User's location */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
            pinColor={theme.primary}
          />

          {/* Coffee shops */}
          {coffeeShops.map((shop) => (
            <Marker
              key={shop.id}
              coordinate={{
                latitude: shop.location.latitude,
                longitude: shop.location.longitude,
              }}
              title={shop.name}
              description={shop.location.address}
            >
              <View style={styles.customMarker}>
                <Icon name="local-cafe" color={theme.primary} size={24} />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>
    );
  };

  const renderCoffeeShopList = () => (
    <ScrollView style={styles.listContainer}>
      {coffeeShops.map((shop) => (
        <CoffeeShopCard
          key={shop.id}
          name={shop.name}
          address={shop.location.address}
          rating={shop.rating}
          reviewCount={shop.reviewCount}
          description={shop.description}
          image={shop.image}
        />
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {renderSearchBar()}
      {showMap ? renderMap() : renderCoffeeShopList()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: theme.text,
  },
  mapToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  customMarker: {
    backgroundColor: "white",
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    flex: 1,
  },
  shopCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  shopImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  shopInfo: {
    flex: 1,
    marginLeft: 15,
  },
  shopName: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 4,
  },
  shopAddress: {
    fontSize: 14,
    color: theme.textLight,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
    color: theme.text,
  },
});

export default SearchScreen;
