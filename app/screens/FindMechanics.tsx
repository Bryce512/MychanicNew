"use client";

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  useColorScheme,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Button from "../components/Button";
import Card, { CardContent } from "../components/Card";
import { styles } from "../theme/styles/FindMechanics.styles";
import { colors } from "../theme/colors";

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
  },
];

export default function FindMechanicsScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [activeTab, setActiveTab] = useState("list");

  const renderMechanicCard = ({ item }: { item: (typeof mechanicData)[0] }) => (
    <MechanicCard mechanic={item} isDark={isDark} />
  );

  return (
    <SafeAreaView style={styles.container}>
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
            <View style={styles.inputContainer}>
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
                  { paddingLeft: 36 },
                ]}
                placeholder="Search for services or shops..."
                placeholderTextColor={
                  isDark ? colors.gray[400] : colors.gray[500]
                }
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.inputContainer}>
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
                  { paddingLeft: 36 },
                ]}
                placeholder="Zip Code or Location"
                placeholderTextColor={
                  isDark ? colors.gray[400] : colors.gray[500]
                }
                value={locationQuery}
                onChangeText={setLocationQuery}
              />
            </View>

            <Button
              title="Search"
              onPress={() => {}}
              style={styles.searchButton}
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
              {mechanicData.map((mechanic) => (
                <MechanicCard
                  key={mechanic.id}
                  mechanic={mechanic}
                  isDark={isDark}
                />
              ))}
            </View>
          ) : (
            <View style={styles.mapContainer}>
              <Text
                style={[styles.mapPlaceholder, isDark && styles.textMutedLight]}
              >
                Interactive map would be displayed here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
  // StatusBar for all screens except Home
  // (If you want to use a specific color, set backgroundColor)
  // Transparent keeps it overlayed on the header
  // Place at the top of the component
  // You can move this to after hooks if you prefer
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" />
      {/* ...existing code... */}
    </>
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
