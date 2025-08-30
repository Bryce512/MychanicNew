import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  Image,
  Linking,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Card, { CardContent } from "./Card";
import { colors } from "../theme/colors";
import { PlaceResult } from "../services/placesService";

interface MechanicCardProps {
  mechanic: PlaceResult;
  onPress?: () => void;
}

export default function MechanicCard({ mechanic, onPress }: MechanicCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const getAvailabilityColor = () => {
    if (mechanic.isOpen === undefined) return colors.gray[400];
    return mechanic.isOpen ? colors.green[500] : colors.red[500];
  };

  const getAvailabilityText = () => {
    if (mechanic.isOpen === undefined) return "Hours unknown";
    return mechanic.isOpen ? "Open now" : "Closed";
  };

  const handleCall = () => {
    if (mechanic.phoneNumber) {
      const phoneUrl = `tel:${mechanic.phoneNumber}`;
      Linking.openURL(phoneUrl).catch((err) => {
        console.error("Failed to make phone call:", err);
        Alert.alert("Error", "Unable to make phone call");
      });
    } else {
      Alert.alert(
        "No Phone Number",
        "Phone number is not available for this mechanic"
      );
    }
  };

  const handleDirections = () => {
    const destination = `${mechanic.latitude},${mechanic.longitude}`;
    const label = encodeURIComponent(mechanic.name);

    // Try to open in Google Maps first, then fallback to Apple Maps
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${mechanic.id}`;
    const appleMapsUrl = `http://maps.apple.com/?daddr=${destination}&q=${label}`;

    Linking.canOpenURL(googleMapsUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(googleMapsUrl);
        } else {
          return Linking.openURL(appleMapsUrl);
        }
      })
      .catch((err) => {
        console.error("Failed to open maps:", err);
        Alert.alert("Error", "Unable to open directions");
      });
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <CardContent style={styles.cardContent}>
          {/* Image Section */}
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
              <Text
                style={[styles.placeholderText, isDark && styles.textMuted]}
              >
                No Image Available
              </Text>
            </View>
          )}

          {/* Header with name and distance */}
          <View style={styles.header}>
            <View style={styles.nameContainer}>
              <Text style={[styles.name, isDark && styles.textLight]}>
                {mechanic.name}
              </Text>
              {mechanic.distance && (
                <Text style={[styles.distance, isDark && styles.textMuted]}>
                  {mechanic.distance} miles
                </Text>
              )}
            </View>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getAvailabilityColor() },
                ]}
              />
              <Text style={[styles.status, { color: getAvailabilityColor() }]}>
                {getAvailabilityText()}
              </Text>
            </View>
          </View>

          {/* Address */}
          <View style={styles.addressContainer}>
            <Feather
              name="map-pin"
              size={14}
              color={isDark ? colors.gray[400] : colors.gray[500]}
            />
            <Text
              style={[styles.address, isDark && styles.textMuted]}
              numberOfLines={2}
            >
              {mechanic.address}
            </Text>
          </View>

          {/* Rating and review count */}
          {mechanic.rating && (
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Feather
                    key={star}
                    name="star"
                    size={14}
                    color={
                      star <= Math.floor(mechanic.rating!)
                        ? colors.accent[500]
                        : colors.gray[300]
                    }
                    style={
                      star <= Math.floor(mechanic.rating!)
                        ? styles.filledStar
                        : undefined
                    }
                  />
                ))}
              </View>
              <Text style={[styles.rating, isDark && styles.textLight]}>
                {mechanic.rating.toFixed(1)}
              </Text>
              {mechanic.reviewCount && (
                <Text style={[styles.reviewCount, isDark && styles.textMuted]}>
                  ({mechanic.reviewCount} reviews)
                </Text>
              )}
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Feather name="phone" size={16} color={colors.primary[500]} />
              <Text style={styles.actionText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDirections}
            >
              <Feather
                name="navigation"
                size={16}
                color={colors.primary[500]}
              />
              <Text style={styles.actionText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onPress}>
              <Feather name="info" size={16} color={colors.primary[500]} />
              <Text style={styles.actionText}>Details</Text>
            </TouchableOpacity>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  cardContent: {
    padding: 0, // Remove padding to allow image to go edge to edge
  },
  mechanicImage: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  placeholderImage: {
    backgroundColor: colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 2,
  },
  distance: {
    fontSize: 14,
    color: colors.gray[500],
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  status: {
    fontSize: 12,
    fontWeight: "500",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  address: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  stars: {
    flexDirection: "row",
    marginRight: 8,
  },
  filledStar: {
    // Add any additional styling for filled stars if needed
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.black,
    marginRight: 6,
  },
  reviewCount: {
    fontSize: 14,
    color: colors.gray[500],
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary[500],
    marginLeft: 4,
  },
  // Dark mode styles
  textLight: {
    color: colors.white,
  },
  textMuted: {
    color: colors.gray[400],
  },
});
