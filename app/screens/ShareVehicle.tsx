import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Feather } from "@expo/vector-icons";
import Card, { CardHeader, CardContent } from "../components/Card";
import SearchBar from "../components/searchBar";
import UserSearchResults from "../components/UserSearchResults";
import { colors } from "../theme/colors";
import { auth, database } from "../../firebaseConfig";
import firebaseService from "../services/firebaseService";
import firebase from "@react-native-firebase/app";

interface User {
  id: string;
  email: string;
  firstName: string;
  // lastName: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  vin?: string;
}

export default function ShareVehicle() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(
    new Set()
  );
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const searchUsers = async (email: string) => {
    if (!email.trim()) {
      setFilteredUsers([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the Cloud Function via REST API
      const response = await fetch(
        "https://us-central1-fluid-tangent-405719.cloudfunctions.net/searchUsers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: { email },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("HTTP Error:", response.status, error);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Search result:", result);

      // The response structure from onCall is wrapped in 'result'
      const data = result.result as { success: boolean; data: User[] };

      if (data.success && data.data) {
        setFilteredUsers(data.data);
        if (data.data.length === 0) {
          setError("No users found with that email");
        }
      }
    } catch (err: any) {
      console.error("Error searching users:", err);
      const errorMessage = err.message || "Error searching for users";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setFilteredUsers([]);
    setSearchQuery("");
    setError(null);
    setSelectedUser(null);
  };

  const refreshSearchResults = async () => {
    // Refresh the current search without clearing the query
    if (searchQuery.trim()) {
      await searchUsers(searchQuery);
    }
  };

  useEffect(() => {
    loadUserVehicles();
  }, []);

  useEffect(() => {
    // Debounce search - only search after user stops typing for 500ms
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      } else {
        setFilteredUsers([]);
        setError(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadUserVehicles = async () => {
    if (!auth.currentUser?.uid) return;

    setLoadingVehicles(true);
    try {
      const vehicleList = await firebaseService.getVehicles(
        auth.currentUser.uid
      );

      const formattedVehicles = vehicleList.map((vehicle: any) => ({
        id: vehicle.id,
        make: vehicle.make || "Unknown",
        model: vehicle.model || "Unknown",
        year: vehicle.year || "N/A",
        vin: vehicle.vin,
      }));

      setVehicles(formattedVehicles);
    } catch (err) {
      console.error("Error loading vehicles:", err);
      Alert.alert("Error", "Failed to load your vehicles");
    } finally {
      setLoadingVehicles(false);
    }
  };

  const toggleVehicleSelection = (vehicleId: string) => {
    const newSelected = new Set(selectedVehicles);
    if (newSelected.has(vehicleId)) {
      newSelected.delete(vehicleId);
    } else {
      newSelected.add(vehicleId);
    }
    setSelectedVehicles(newSelected);
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSelectedVehicles(new Set());
  };

  const handleShareVehicles = async () => {
    if (!selectedUser || selectedVehicles.size === 0) {
      Alert.alert("Error", "Please select a user and at least one vehicle");
      return;
    }

    setSharing(true);
    try {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) return;

      for (const vehicleId of selectedVehicles) {
        await database
          .ref(
            `users/${currentUserId}/vehicles/${vehicleId}/owners/${selectedUser.id}`
          )
          .set({
            id: selectedUser.id,
            email: selectedUser.email,
            firstName: selectedUser.firstName,
            // lastName: selectedUser.lastName,
          });
      }

      Alert.alert(
        "Success",
        `Vehicle(s) shared with ${selectedUser.firstName}!`
      );
      setSelectedUser(null);
      setSelectedVehicles(new Set());
      setFilteredUsers([]);
    } catch (err) {
      console.error("Error sharing vehicles:", err);
      Alert.alert("Error", "Failed to share vehicles");
    } finally {
      setSharing(false);
    }
  };

  const renderVehicleCard = (vehicle: Vehicle) => {
    const isSelected = selectedVehicles.has(vehicle.id);

    return (
      <TouchableOpacity
        key={vehicle.id}
        style={styles.vehicleCardTouchable}
        onPress={() => toggleVehicleSelection(vehicle.id)}
        activeOpacity={0.7}
      >
        <Card
          style={
            isSelected
              ? { borderWidth: 2, borderColor: colors.primary[500] }
              : undefined
          }
        >
          <CardContent>
            <View style={styles.vehicleRow}>
              <View style={styles.vehicleInfo}>
                <Text
                  style={[
                    styles.vehicleName,
                    { color: isDark ? colors.white : colors.gray[900] },
                  ]}
                >
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </Text>
                {vehicle.vin && (
                  <Text
                    style={[
                      styles.vehicleVin,
                      { color: isDark ? colors.gray[400] : colors.gray[600] },
                    ]}
                  >
                    VIN: {vehicle.vin}
                  </Text>
                )}
              </View>
              <Feather
                name={isSelected ? "check-square" : "square"}
                size={24}
                color={isSelected ? colors.primary[500] : colors.gray[400]}
              />
            </View>
          </CardContent>
        </Card>
      </TouchableOpacity>
    );
  };

  if ((loading && filteredUsers.length === 0) || loadingVehicles) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: isDark ? colors.gray[900] : colors.gray[50] },
        ]}
        edges={["bottom", "left", "right"]}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={isDark ? colors.gray[900] : colors.gray[50]}
        />
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text
          style={[
            styles.loadingText,
            { color: isDark ? colors.white : colors.gray[900] },
          ]}
        >
          {loadingVehicles ? "Loading Vehicles..." : "Searching Users..."}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.gray[900] : colors.gray[50] },
      ]}
      edges={["bottom", "left", "right"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? colors.gray[900] : colors.gray[50]}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            { color: isDark ? colors.white : colors.gray[900] },
          ]}
        >
          Share Vehicle
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* User Search Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? colors.white : colors.gray[900] },
            ]}
          >
            Select User to Share With
          </Text>
          <View style={styles.searchContainer}>
            <SearchBar
              placeholder="Search by email..."
              value={searchQuery}
              onSearch={setSearchQuery}
              onClear={clearSearch}
            />
          </View>

          {loading && filteredUsers.length > 0 && (
            <View
              style={[
                styles.reloadingContainer,
                {
                  backgroundColor: isDark
                    ? colors.primary[900]
                    : colors.primary[50],
                },
              ]}
            >
              <ActivityIndicator size="small" color={colors.primary[500]} />
              <Text
                style={[
                  styles.reloadingText,
                  { color: isDark ? colors.white : colors.gray[900] },
                ]}
              >
                Updating search...
              </Text>
            </View>
          )}

          <UserSearchResults
            filteredUsers={filteredUsers}
            selectedUser={selectedUser}
            loading={loading}
            error={error}
            onSelectUser={handleSelectUser}
          />
        </View>

        {/* Vehicles Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? colors.white : colors.gray[900] },
            ]}
          >
            Select Vehicles to Share
          </Text>
          {vehicles.length === 0 ? (
            <Text
              style={[
                styles.emptyText,
                { color: isDark ? colors.gray[400] : colors.gray[600] },
              ]}
            >
              No vehicles found
            </Text>
          ) : (
            <View style={styles.vehiclesContainer}>
              {vehicles.map((vehicle) => renderVehicleCard(vehicle))}
            </View>
          )}
        </View>

        {/* Share Button */}
        {selectedUser && selectedVehicles.size > 0 && (
          <View style={styles.shareButtonContainer}>
            <TouchableOpacity
              style={[
                styles.shareButton,
                { backgroundColor: colors.primary[500] },
              ]}
              onPress={handleShareVehicles}
              disabled={sharing}
            >
              {sharing ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.shareButtonText}>
                  Share {selectedVehicles.size} Vehicle
                  {selectedVehicles.size > 1 ? "s" : ""}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  reloadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  reloadingText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  usersContainer: {
    gap: 12,
  },
  userCardTouchable: {
    marginBottom: 4,
  },
  userCard: {
    marginBottom: 0,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: "400",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  vehiclesContainer: {
    gap: 0,
  },
  vehicleCardTouchable: {
    marginBottom: 0,
  },
  vehicleCard: {
    marginBottom: 0,
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  vehicleVin: {
    fontSize: 13,
    fontWeight: "400",
  },
  shareButtonContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  shareButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  shareButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
