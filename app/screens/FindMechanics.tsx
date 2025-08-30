"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  useColorScheme,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import Button from "../components/Button";
import Card, { CardContent } from "../components/Card";
import { styles } from "../theme/styles/FindMechanics.styles";
import { colors } from "../theme/colors";
import {
  PlacesService,
  getMockMechanicData,
  type PlaceResult,
} from "../services/placesService";

// Mock data
const mechanicData = [
  {
    id: 1,
    name: "Precision Auto Care",
    image: "https://via.placeholder.com/300x200",
    location: "Austin, TX",
    distance: 2.4,
    availability: "Available Today",
    rating: 4.8,
    reviewCount: 243,
    services: ["Oil Change", "Brake Service", "Engine Repair"],
    pricingTransparency: "Customer can choose parts",
    certification: "ASE Certified Master Technician",
    startingPrice: 49,
    estimatedTime: "Est. time: 1-2 hours",
    latitude: 30.2672,
    longitude: -97.7431,
  },
  {
    id: 2,
    name: "Hometown Mechanics",
    image: "https://via.placeholder.com/300x200",
    location: "Austin, TX",
    distance: 3.1,
    availability: "Available Tomorrow",
    rating: 4.6,
    reviewCount: 187,
    services: ["Transmission", "Engine Diagnostics", "Brake Service"],
    pricingTransparency: "Uses best value parts",
    certification: "Factory Trained Specialists",
    startingPrice: 39,
    estimatedTime: "Est. time: 1-3 hours",
    latitude: 30.2849,
    longitude: -97.7341,
  },
  {
    id: 3,
    name: "AutoTech Solutions",
    image: "https://via.placeholder.com/300x200",
    location: "Austin, TX",
    distance: 4.5,
    availability: "Available Today",
    rating: 4.9,
    reviewCount: 311,
    services: ["Engine Repair", "Electrical Systems", "Transmission"],
    pricingTransparency: "Customer can choose parts",
    certification: "ASE and Factory Certified",
    startingPrice: 59,
    estimatedTime: "Est. time: 2-4 hours",
    latitude: 30.25,
    longitude: -97.75,
  },
];

export default function FindMechanicsScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [nearbyMechanics, setNearbyMechanics] = useState<PlaceResult[]>([]);
  const [isLoadingMechanics, setIsLoadingMechanics] = useState(false);
  const [useMockData, setUseMockData] = useState(false); // Toggle for testing - set to true while API key is being configured

  useEffect(() => {
    // Re-enable location services
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
        setLocationPermission(false);
        Alert.alert(
          "Location Permission",
          "Location permission is required to show nearby mechanics on the map.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingMechanics(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      console.log("Got user location:", coords);
      setUserLocation(coords);

      // Fetch nearby mechanics after getting location
      fetchNearbyMechanics(coords.latitude, coords.longitude);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Unable to get your location. Please try again.");
      
      // Fallback to Austin location if location fails
      const fallbackCoords = {
        latitude: 30.2672,
        longitude: -97.7431,
      };
      setUserLocation(fallbackCoords);
      fetchNearbyMechanics(fallbackCoords.latitude, fallbackCoords.longitude);
    } finally {
      setIsLoadingMechanics(false);
    }
  };

  const fetchNearbyMechanics = async (latitude: number, longitude: number) => {
    setIsLoadingMechanics(true);
    try {
      // PlacesService now handles fallback to mock data internally
      const mechanics = await PlacesService.searchNearbyMechanics(
        latitude,
        longitude
      );
      setNearbyMechanics(mechanics);
    } catch (error) {
      console.error("Error fetching nearby mechanics:", error);
      // Final fallback to mock data
      const fallbackMechanics = getMockMechanicData(latitude, longitude);
      setNearbyMechanics(fallbackMechanics);
    } finally {
      setIsLoadingMechanics(false);
    }
  };

  // Calculate map region to show at least 5 mechanics
  const calculateMapRegion = () => {
    if (!userLocation) {
      return {
        latitude: 30.2672,
        longitude: -97.7431,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    if (nearbyMechanics.length < 5) {
      // Zoom out more to potentially show more mechanics
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.15, // Larger delta = more zoomed out
        longitudeDelta: 0.15,
      };
    }

    // Calculate bounds to fit all mechanics
    const latitudes = nearbyMechanics.map(m => m.latitude);
    const longitudes = nearbyMechanics.map(m => m.longitude);
    
    const minLat = Math.min(...latitudes, userLocation.latitude);
    const maxLat = Math.max(...latitudes, userLocation.latitude);
    const minLng = Math.min(...longitudes, userLocation.longitude);
    const maxLng = Math.max(...longitudes, userLocation.longitude);
    
    const latDelta = (maxLat - minLat) * 1.3; // Add 30% padding
    const lngDelta = (maxLng - minLng) * 1.3;
    
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.05), // Minimum zoom level
      longitudeDelta: Math.max(lngDelta, 0.05),
    };
  };

  const handleSearch = async () => {
    if (!userLocation) return;

    if (searchQuery.trim()) {
      setIsLoadingMechanics(true);
      try {
        let mechanics: PlaceResult[];

        if (useMockData) {
          // Filter mock data by search query
          const mockMechanics = getMockMechanicData(
            userLocation.latitude,
            userLocation.longitude
          );
          mechanics = mockMechanics.filter(
            (mechanic) =>
              mechanic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              mechanic.address.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else {
          // Search using Google Places API
          mechanics = await PlacesService.searchMechanicsByText(
            searchQuery,
            userLocation.latitude,
            userLocation.longitude
          );
        }

        setNearbyMechanics(mechanics);
      } catch (error) {
        console.error("Error searching mechanics:", error);
      } finally {
        setIsLoadingMechanics(false);
      }
    } else {
      // Reset to all nearby mechanics
      await fetchNearbyMechanics(userLocation.latitude, userLocation.longitude);
    }
  };

  const renderMechanicCard = ({ item }: { item: (typeof mechanicData)[0] }) => (
    <MechanicCard mechanic={item} isDark={isDark} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.textLight]}>
            Find Mechanics
          </Text>
          <Text style={[styles.subtitle, isDark && styles.textMutedLight]}>
            Search for trusted mechanics in your area with transparent pricing
            and verified reviews.
          </Text>

          <View style={styles.searchContainer}>
            <View style={styles.searchRow}>
              <View
                style={[
                  styles.searchInputContainer,
                  isDark && styles.searchInputContainerDark,
                ]}
              >
                <Feather
                  name="search"
                  size={16}
                  color={isDark ? colors.gray[400] : colors.gray[500]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    isDark && styles.inputDark,
                    { paddingLeft: 24 },
                  ]}
                  placeholder="Search for services or shops"
                  placeholderTextColor={
                    isDark ? colors.gray[400] : colors.gray[500]
                  }
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <View
                style={[
                  styles.zipInputContainer,
                  isDark && styles.zipInputContainerDark,
                ]}
              >
                <Feather
                  name="map-pin"
                  size={16}
                  color={isDark ? colors.gray[400] : colors.gray[500]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    isDark && styles.inputDark,
                    { paddingLeft: 24 },
                  ]}
                  placeholder="Zip Code"
                  placeholderTextColor={
                    isDark ? colors.gray[400] : colors.gray[500]
                  }
                  value={locationQuery}
                  onChangeText={setLocationQuery}
                />
              </View>
            </View>

            <Button
              title={isLoadingMechanics ? "Searching..." : "Search"}
              onPress={handleSearch}
              style={styles.searchButton}
              disabled={isLoadingMechanics}
            />
          </View>
        </View>

        <View style={styles.filtersRow}>
          <TouchableOpacity
            style={[styles.filterButton, isDark && styles.filterButtonDark]}
          >
            <Feather
              name="filter"
              size={14}
              color={isDark ? colors.white : colors.gray[900]}
            />
            <Text style={[styles.filterButtonText, isDark && styles.textLight]}>
              Filters
            </Text>
          </TouchableOpacity>

          <View style={styles.sortContainer}>
            <Text style={[styles.sortLabel, isDark && styles.textMutedLight]}>
              Sort by:
            </Text>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={[styles.sortButtonText, isDark && styles.textLight]}>
                Recommended
              </Text>
              <Feather
                name="chevron-down"
                size={16}
                color={isDark ? colors.white : colors.gray[900]}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <View style={styles.tabsHeader}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "list" && styles.activeTabButton,
                isDark && styles.tabButtonDark,
                activeTab === "list" && isDark && styles.activeTabButtonDark,
              ]}
              onPress={() => setActiveTab("list")}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "list" && styles.activeTabButtonText,
                  isDark && styles.textLight,
                ]}
              >
                List View
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "map" && styles.activeTabButton,
                isDark && styles.tabButtonDark,
                activeTab === "map" && isDark && styles.activeTabButtonDark,
              ]}
              onPress={() => setActiveTab("map")}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "map" && styles.activeTabButtonText,
                  isDark && styles.textLight,
                ]}
              >
                Map View
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "list" ? (
            <View style={styles.mechanicsContainer}>
              {isLoadingMechanics ? (
                <View style={styles.loadingContainer}>
                  <Text
                    style={[styles.loadingText, isDark && styles.textLight]}
                  >
                    Finding nearby mechanics...
                  </Text>
                </View>
              ) : nearbyMechanics.length > 0 ? (
                nearbyMechanics.map((mechanic) => (
                  <RealMechanicCard
                    key={mechanic.id}
                    mechanic={mechanic}
                    isDark={isDark}
                  />
                ))
              ) : (
                <View style={styles.noResultsContainer}>
                  <Feather
                    name="search"
                    size={48}
                    color={isDark ? colors.gray[400] : colors.gray[500]}
                  />
                  <Text
                    style={[styles.noResultsText, isDark && styles.textLight]}
                  >
                    No mechanics found nearby
                  </Text>
                  <Text
                    style={[
                      styles.noResultsSubtext,
                      isDark && styles.textMutedLight,
                    ]}
                  >
                    Try adjusting your search criteria or location
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.mapContainer}>
              {locationPermission && userLocation ? (
                <MapView
                  style={styles.map}
                  initialRegion={calculateMapRegion()}
                  showsUserLocation={true}
                  showsMyLocationButton={true}
                >
                  {nearbyMechanics.map((mechanic) => (
                    <Marker
                      key={mechanic.id}
                      coordinate={{
                        latitude: mechanic.latitude,
                        longitude: mechanic.longitude,
                      }}
                      title={mechanic.name}
                      description={`${
                        mechanic.rating
                          ? mechanic.rating.toFixed(1) + "⭐"
                          : "No rating"
                      } • ${mechanic.address}`}
                    >
                      <View style={styles.markerContainer}>
                        <View
                          style={[
                            styles.marker,
                            mechanic.isOpen === true
                              ? styles.markerAvailable
                              : styles.markerBusy,
                          ]}
                        >
                          <Feather name="tool" size={16} color={colors.white} />
                        </View>
                      </View>
                      <Callout style={styles.callout}>
                        <View style={styles.calloutContent}>
                          <Text style={styles.calloutTitle}>
                            {mechanic.name}
                          </Text>
                          <Text style={styles.calloutLocation}>
                            {mechanic.address}
                            {mechanic.distance &&
                              ` • ${mechanic.distance} miles`}
                          </Text>
                          <View style={styles.calloutRating}>
                            <Feather
                              name="star"
                              size={12}
                              color={colors.primary[500]}
                            />
                            <Text style={styles.calloutRatingText}>
                              {mechanic.rating} ({mechanic.reviewCount})
                            </Text>
                          </View>
                          <Text style={styles.calloutPrice}>
                            {mechanic.isOpen === undefined
                              ? "Hours unknown"
                              : mechanic.isOpen
                              ? "Open now"
                              : "Closed"}
                          </Text>
                        </View>
                      </Callout>
                    </Marker>
                  ))}
                </MapView>
              ) : (
                <View style={styles.mapPlaceholderContainer}>
                  <Feather
                    name="map-pin"
                    size={48}
                    color={isDark ? colors.gray[400] : colors.gray[500]}
                  />
                  <Text
                    style={[
                      styles.mapPlaceholder,
                      isDark && styles.textMutedLight,
                    ]}
                  >
                    {locationPermission
                      ? "Loading map..."
                      : "Location permission required for map view"}
                  </Text>
                  {!locationPermission && (
                    <Button
                      title="Enable Location"
                      onPress={requestLocationPermission}
                      style={styles.enableLocationButton}
                      size="sm"
                    />
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type Mechanic = (typeof mechanicData)[0];

function MechanicCard({
  mechanic,
  isDark,
}: {
  mechanic: Mechanic;
  isDark: boolean;
}) {
  const navigation = useNavigation();

  return (
    <Card style={styles.mechanicCard}>
      <CardContent style={styles.mechanicCardContent}>
        <Image
          source={{ uri: mechanic.image }}
          style={styles.mechanicImage}
          resizeMode="cover"
        />

        <View style={styles.mechanicInfo}>
          <View style={styles.mechanicHeader}>
            <View>
              <Text style={[styles.mechanicName, isDark && styles.textLight]}>
                {mechanic.name}
              </Text>
              <View style={styles.locationContainer}>
                <Feather
                  name="map-pin"
                  size={12}
                  color={isDark ? colors.gray[400] : colors.gray[500]}
                />
                <Text
                  style={[styles.locationText, isDark && styles.textMutedLight]}
                >
                  {mechanic.location} • {mechanic.distance} miles away
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.availabilityBadge,
                mechanic.availability === "Available Today"
                  ? styles.availabilityToday
                  : styles.availabilityTomorrow,
                isDark && styles.availabilityBadgeDark,
              ]}
            >
              <Text
                style={[
                  styles.availabilityText,
                  mechanic.availability === "Available Today"
                    ? styles.availabilityTodayText
                    : styles.availabilityTomorrowText,
                  isDark && styles.availabilityTextDark,
                ]}
              >
                {mechanic.availability}
              </Text>
            </View>
          </View>

          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, i) => (
                <Feather
                  key={i}
                  name="star"
                  size={14}
                  color={
                    i < Math.floor(mechanic.rating)
                      ? colors.primary[500]
                      : colors.gray[300]
                  }
                />
              ))}
            </View>
            <Text style={[styles.ratingText, isDark && styles.textLight]}>
              {mechanic.rating.toFixed(1)}
            </Text>
            <Text style={[styles.reviewCount, isDark && styles.textMutedLight]}>
              ({mechanic.reviewCount} reviews)
            </Text>
          </View>

          <View style={styles.servicesContainer}>
            {mechanic.services.map((service, index) => (
              <View
                key={index}
                style={[styles.serviceBadge, isDark && styles.serviceBadgeDark]}
              >
                <Text style={[styles.serviceText, isDark && styles.textLight]}>
                  {service}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Feather
                name="dollar-sign"
                size={14}
                color={isDark ? colors.gray[400] : colors.gray[500]}
              />
              <Text
                style={[styles.detailText, isDark && styles.textMutedLight]}
              >
                {mechanic.pricingTransparency}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Feather
                name="check-circle"
                size={14}
                color={isDark ? colors.gray[400] : colors.gray[500]}
              />
              <Text
                style={[styles.detailText, isDark && styles.textMutedLight]}
              >
                {mechanic.certification}
              </Text>
            </View>
          </View>

          <View style={styles.mechanicFooter}>
            <Text style={[styles.priceText, isDark && styles.textLight]}>
              Starting at ${mechanic.startingPrice} • {mechanic.estimatedTime}
            </Text>

            <Button
              title="View Profile"
              onPress={() => {}}
              // onPress={() => navigation.navigate("MechanicProfile", { id: mechanic.id })}
              size="sm"
            />
          </View>
        </View>
      </CardContent>
    </Card>
  );
}

function RealMechanicCard({
  mechanic,
  isDark,
}: {
  mechanic: PlaceResult;
  isDark: boolean;
}) {
  const getAvailabilityStatus = () => {
    if (mechanic.isOpen === undefined) return "Hours unknown";
    return mechanic.isOpen ? "Open now" : "Closed";
  };

  const getAvailabilityStyle = () => {
    if (mechanic.isOpen === undefined) return styles.availabilityTomorrow;
    return mechanic.isOpen
      ? styles.availabilityToday
      : styles.availabilityTomorrow;
  };

  const getAvailabilityTextStyle = () => {
    if (mechanic.isOpen === undefined) return styles.availabilityTomorrowText;
    return mechanic.isOpen
      ? styles.availabilityTodayText
      : styles.availabilityTomorrowText;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Feather key={i} name="star" size={14} color={colors.primary[500]} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Feather key={i} name="star" size={14} color={colors.primary[300]} />
        );
      } else {
        stars.push(
          <Feather key={i} name="star" size={14} color={colors.gray[300]} />
        );
      }
    }
    return stars;
  };

  return (
    <Card style={styles.mechanicCard}>
      <CardContent style={styles.mechanicCardContent}>
        {mechanic.photoUrl ? (
          <Image
            source={{ uri: mechanic.photoUrl }}
            style={styles.mechanicImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.mechanicImage, styles.placeholderImage]}>
            <Feather
              name="tool"
              size={32}
              color={isDark ? colors.gray[400] : colors.gray[500]}
            />
          </View>
        )}

        <View style={styles.mechanicInfo}>
          <View style={styles.mechanicHeader}>
            <View>
              <Text style={[styles.mechanicName, isDark && styles.textLight]}>
                {mechanic.name}
              </Text>
              <View style={styles.locationContainer}>
                <Feather
                  name="map-pin"
                  size={12}
                  color={isDark ? colors.gray[400] : colors.gray[500]}
                />
                <Text
                  style={[styles.locationText, isDark && styles.textMutedLight]}
                >
                  {mechanic.address}
                  {mechanic.distance && ` • ${mechanic.distance} miles away`}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.availabilityBadge,
                getAvailabilityStyle(),
                isDark && styles.availabilityBadgeDark,
              ]}
            >
              <Text
                style={[
                  styles.availabilityText,
                  getAvailabilityTextStyle(),
                  isDark && styles.availabilityTextDark,
                ]}
              >
                {getAvailabilityStatus()}
              </Text>
            </View>
          </View>

          {mechanic.rating && (
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(mechanic.rating)}
              </View>
              <Text style={[styles.ratingText, isDark && styles.textLight]}>
                {mechanic.rating.toFixed(1)}
              </Text>
              {mechanic.reviewCount && (
                <Text
                  style={[styles.reviewCount, isDark && styles.textMutedLight]}
                >
                  ({mechanic.reviewCount} reviews)
                </Text>
              )}
            </View>
          )}

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Feather
                name="clock"
                size={14}
                color={isDark ? colors.gray[400] : colors.gray[500]}
              />
              <Text
                style={[styles.detailText, isDark && styles.textMutedLight]}
              >
                Auto Repair Service
              </Text>
            </View>

            {mechanic.priceLevel && (
              <View style={styles.detailItem}>
                <Feather
                  name="dollar-sign"
                  size={14}
                  color={isDark ? colors.gray[400] : colors.gray[500]}
                />
                <Text
                  style={[styles.detailText, isDark && styles.textMutedLight]}
                >
                  {"$".repeat(mechanic.priceLevel)} Price Level
                </Text>
              </View>
            )}
          </View>

          <View style={styles.mechanicFooter}>
            <Text style={[styles.priceText, isDark && styles.textLight]}>
              {mechanic.distance
                ? `${mechanic.distance} miles away`
                : "Distance unknown"}
            </Text>

            <Button title="View Details" onPress={() => {}} size="sm" />
          </View>
        </View>
      </CardContent>
    </Card>
  );
}
