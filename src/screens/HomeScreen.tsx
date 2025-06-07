import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Text, Card, Button, Icon, Image, Divider } from "@rneui/themed";

const SCREEN_WIDTH = Dimensions.get("window").width;

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" type="material" size={20} color="#666" />
          <TextInput
            placeholder="Search any coffee..."
            style={styles.searchInput}
            placeholderTextColor="#666"
          />
        </View>
      </View>

      {/* New Feature Card */}
      <TouchableOpacity style={styles.newFeatureCard}>
        <View style={styles.newFeatureContent}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            }}
            style={styles.newFeatureImage}
          />
          <View style={styles.newFeatureTextContainer}>
            <View style={styles.newTag}>
              <Text style={styles.newTagText}>New!</Text>
            </View>
            <Text style={styles.newFeatureTitle}>Food pairing search</Text>
            <Text style={styles.newFeatureSubtitle}>
              Find the perfect coffee for your meal
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Coffee Categories */}
      <Text style={styles.sectionTitle}>Shop coffee by type</Text>
      <View style={styles.categoriesGrid}>
        <TouchableOpacity style={styles.categoryCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            }}
            style={styles.categoryImage}
          />
          <Text style={styles.categoryText}>Light Roast</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            }}
            style={styles.categoryImage}
          />
          <Text style={styles.categoryText}>Medium Roast</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            }}
            style={styles.categoryImage}
          />
          <Text style={styles.categoryText}>Dark Roast</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            }}
            style={styles.categoryImage}
          />
          <Text style={styles.categoryText}>Espresso</Text>
        </TouchableOpacity>
      </View>

      {/* Best Offers */}
      <TouchableOpacity style={styles.offersCard}>
        <Icon name="local-offer" type="material" color="#6F4E37" size={24} />
        <Text style={styles.offersText}>Shop our best offers</Text>
        <Icon name="chevron-right" type="material" color="#6F4E37" size={24} />
      </TouchableOpacity>

      {/* Coffee Origins */}
      <Text style={styles.sectionTitle}>Coffee origins</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.originsContainer}
      >
        <TouchableOpacity style={styles.originCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-150004575050-6dbc0df9e5f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            }}
            style={styles.originImage}
          />
          <Text style={styles.originName}>Ethiopia</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.originCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            }}
            style={styles.originImage}
          />
          <Text style={styles.originName}>Colombia</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.originCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1542478050-9c2d0e17b723?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            }}
            style={styles.originImage}
          />
          <Text style={styles.originName}>Brazil</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* View Map Button */}
      <TouchableOpacity style={styles.mapCard}>
        <Icon name="map" type="material" color="#6F4E37" size={24} />
        <View style={styles.mapTextContainer}>
          <Text style={styles.mapTitle}>View Map</Text>
          <Text style={styles.mapSubtitle}>
            Find roasters and cafes near you
          </Text>
        </View>
        <Icon name="chevron-right" type="material" color="#6F4E37" size={24} />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    padding: 15,
    backgroundColor: "white",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 10,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
  },
  newFeatureCard: {
    margin: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  newFeatureContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  newFeatureImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  newFeatureTextContainer: {
    flex: 1,
    padding: 15,
  },
  newTag: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  newTagText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  newFeatureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  newFeatureSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
    marginTop: 20,
    marginBottom: 15,
    color: "#000",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 7.5,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 45) / 2,
    height: 120,
    margin: 7.5,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  categoryText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.3)",
    height: "100%",
  },
  offersCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE4E1",
    margin: 15,
    padding: 15,
    borderRadius: 12,
  },
  offersText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#6F4E37",
  },
  originsContainer: {
    paddingLeft: 15,
  },
  originCard: {
    width: 160,
    height: 120,
    marginRight: 15,
    borderRadius: 12,
    overflow: "hidden",
  },
  originImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  originName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.3)",
    height: "100%",
  },
  mapCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 15,
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  mapTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  mapSubtitle: {
    fontSize: 14,
    color: "#666",
  },
});

export default HomeScreen;
