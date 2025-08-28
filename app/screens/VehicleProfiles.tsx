"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
} from "react-native";
import { useBluetooth } from "../contexts/BluetoothContext";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  NavigationProp,
  useIsFocused,
} from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Feather } from "@expo/vector-icons";
import Button from "../components/Button";
import Card, { CardContent, CardHeader } from "../components/Card";
import { colors } from "../theme/colors";

const DEFAULT_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/fluid-tangent-405719.firebasestorage.app/o/public%2Fcar_default.png?alt=media&token=5232adad-a5f7-4b8c-be47-781163a7eaa1";
import firebaseService from "../services/firebaseService";
import { useDiagnostics } from "../contexts/VehicleDiagnosticsContext";
import { pidCommands } from "../services/pidCommands";
import { Alert } from "react-native";

export default function VehicleProfilesScreen() {
  // All hooks must be called unconditionally and in the same order on every render
  const diagnosticsContext = useDiagnostics();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState(0);
  const [loading, setLoading] = useState(true);
  const bluetoothContext = useBluetooth();
  const { getCurrentVoltage, getEngineRPM } = pidCommands();
  const isFocused = useIsFocused();

  // Helper to sync diagnostics data (voltage, rpm) for selected vehicle
  const syncVehicleDiagnostics = async () => {
    const { deviceId, isConnected, plxDevice } = bluetoothContext;
    const { diagnostics, refreshDiagnostics } = diagnosticsContext;
    const vehicle = vehicles[selectedVehicle];
    if (!isConnected || !plxDevice || !vehicle) {
      Alert.alert(
        "No OBD-II Device Connected",
        "Please connect to an OBD-II device first."
      );
      return;
    }
    try {
      const voltage = await getCurrentVoltage(plxDevice);
      const rpm = await getEngineRPM(plxDevice);
      // Parse voltage: extract first valid number (e.g., 12.4) from response string
      let parsedVoltage = 0;
      if (typeof voltage === "string") {
        const match = voltage.match(/(\d+\.?\d*)/);
        if (match) parsedVoltage = parseFloat(match[1]);
      } else if (typeof voltage === "number") {
        parsedVoltage = voltage;
      }
      // Update diagnostics context locally (refreshDiagnostics will reload from DB, so we update DB first)
      const userId = firebaseService.getCurrentUser()?.uid;
      if (!userId) throw new Error("No user ID");
      // Prepare new diagnostics data
      const newDiag = {
        ...diagnostics[vehicle.id],
        battV: parsedVoltage,
        rpm: typeof rpm === "number" && !isNaN(rpm) ? rpm : 0,
        lastSync: Date.now(),
      };
      // Update DB
      await firebaseService.updateVehicleDiagInfo(userId, vehicle.id, newDiag);
      // Refresh context from DB
      await refreshDiagnostics();
      Alert.alert("Diagnostics Synced", "Voltage and RPM updated.");
    } catch (err) {
      const errorMessage =
        err && typeof err === "object" && "message" in err
          ? (err as Error).message
          : "Could not sync diagnostics.";
      Alert.alert("Sync Failed", errorMessage);
    }
  };
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Feather
          name="user"
          size={24}
          style={{ marginRight: 16, color: colors.white }}
          onPress={() => navigation.navigate("Profile")}
        />
      ),
      headerShown: true,
      title: "My Vehicles",
    });
  }, [navigation]);

  // Fetch vehicles on focus or when Bluetooth connection status/device changes
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const currentUser = firebaseService.getCurrentUser();
        if (currentUser) {
          await firebaseService.ensureUserProfile(currentUser);
          const userVehicles = await firebaseService.getVehicles(
            currentUser.uid
          );
          setVehicles(userVehicles || []);
          if (
            userVehicles?.length > 0 &&
            selectedVehicle >= userVehicles.length
          ) {
            setSelectedVehicle(0);
          }
        }
      } catch (error) {
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchVehicles();
    }
    // Subscribe to auth changes to reload vehicles when user changes
    const unsubscribe = firebaseService.onAuthChange((user) => {
      if (user) {
        fetchVehicles();
      } else {
        setVehicles([]);
      }
    });

    return () => unsubscribe();
    // Add deviceId and isConnected as dependencies to rerender on Bluetooth changes
  }, [isFocused, bluetoothContext.deviceId, bluetoothContext.isConnected]);

  const handleViewDiagnosticDetails = (
    navigation: NavigationProp<RootStackParamList>
  ) => {
    navigation.navigate("DiagnosticsDetail", {
      userId: 101, // Replace with actual user ID
      carId: 123, // Replace with actual car ID
      diagnosticCode: "PO420", // Replace with actual diagnostic code
    });
  };

  // Add loading state handling
  if (loading || diagnosticsContext.loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={isDark ? styles.textLight : undefined}>
            Loading vehicles...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Helper to determine if the connect alert should be shown for the selected vehicle
  const showConnectAlert = (() => {
    const { deviceId, isConnected } = bluetoothContext;
    if (!vehicles[selectedVehicle]) return false;
    const vehicle = vehicles[selectedVehicle];
    // Use the correct OBD UUID field (adjust if your DB uses a different field)
    const expectedUuid = vehicle.obdUUID || vehicle.obdScannerUuid;
    const vehicleIsConnected =
      isConnected && deviceId && expectedUuid && deviceId === expectedUuid;
    return !vehicleIsConnected;
  })();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, isDark && styles.textLight]}>
              My Vehicles
            </Text>
            <Text style={[styles.subtitle, isDark && styles.textMutedLight]}>
              Manage your vehicle profiles and view diagnostic data
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Vehicle List */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.vehicleListContainer}
          >
            {vehicles.map((vehicle, index) => {
              const { deviceId, isConnected } = bluetoothContext;
              const vehicleIsConnected =
                isConnected && deviceId === vehicle.obdUUID;
              return (
                <TouchableOpacity
                  key={vehicle.id}
                  onPress={() => setSelectedVehicle(index)}
                  style={[
                    styles.vehicleCard,
                    selectedVehicle === index && styles.selectedVehicleCard,
                    isDark && styles.vehicleCardDark,
                    selectedVehicle === index &&
                      isDark &&
                      styles.selectedVehicleCardDark,
                  ]}
                >
                  <View style={styles.vehicleCardHeader}>
                    <Text
                      style={[styles.vehicleName, isDark && styles.textLight]}
                    >
                      {vehicle.name}
                    </Text>

                    <View
                      style={[
                        styles.connectionBadge,
                        vehicleIsConnected
                          ? styles.connectedBadge
                          : styles.notConnectedBadge,
                        isDark && styles.connectionBadgeDark,
                      ]}
                    >
                      {vehicleIsConnected ? (
                        <View style={styles.badgeContent}>
                          <Feather
                            name="check-circle"
                            size={12}
                            color={colors.green[500]}
                          />
                          <Text style={styles.connectedText}>Connected</Text>
                        </View>
                      ) : (
                        <Text
                          style={[
                            styles.notConnectedText,
                            isDark && styles.textMutedLight,
                          ]}
                        >
                          Not Connected
                        </Text>
                      )}
                    </View>
                  </View>

                  <Image
                    source={{ uri: vehicle.image || DEFAULT_IMAGE }}
                    style={styles.vehicleImage}
                    resizeMode="contain"
                  />

                  <View style={styles.vehicleStatus}>
                    <View style={styles.statusHeader}>
                      <Text
                        style={[
                          styles.statusLabel,
                          isDark && styles.textMutedLight,
                        ]}
                      >
                        Health Status
                      </Text>
                      <Text
                        style={[
                          styles.statusValue,
                          vehicle.status === "Good"
                            ? styles.statusGood
                            : vehicle.status === "Fair"
                            ? styles.statusFair
                            : vehicle.status === "Poor"
                            ? styles.statusPoor
                            : styles.statusUnknown,
                          isDark &&
                            vehicle.status === "Unknown" &&
                            styles.textMutedLight,
                        ]}
                      >
                        {vehicle.status}
                      </Text>
                    </View>

                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${vehicle.progress}%` },
                          vehicle.status === "Good"
                            ? styles.progressGood
                            : vehicle.status === "Fair"
                            ? styles.progressFair
                            : vehicle.status === "Poor"
                            ? styles.progressPoor
                            : styles.progressUnknown,
                        ]}
                      />
                    </View>

                    <View style={styles.vehicleFooter}>
                      {vehicle.obdUUID ? (
                        <View style={styles.syncInfo}>
                          <Feather
                            name="clock"
                            size={12}
                            color={isDark ? colors.gray[400] : colors.gray[500]}
                          />
                          <Text
                            style={[
                              styles.syncText,
                              isDark && styles.textMutedLight,
                            ]}
                          >
                            Last sync:{" "}
                            {diagnosticsContext.diagnostics[vehicle.id]
                              ?.lastSync
                              ? new Date(
                                  diagnosticsContext.diagnostics[
                                    vehicle.id
                                  ].lastSync
                                ).toLocaleString()
                              : "-"}
                          </Text>
                        </View>
                      ) : !isConnected ? (
                        <View style={styles.syncInfo}>
                          <Feather
                            name="alert-triangle"
                            size={12}
                            color={isDark ? colors.gray[400] : colors.gray[500]}
                          />
                          <Text
                            style={[
                              styles.syncText,
                              isDark && styles.textMutedLight,
                            ]}
                          >
                            Connect OBD-II for diagnostics
                          </Text>
                        </View>
                      ) : null}

                      {vehicle.alerts > 0 && (
                        <View style={styles.alertInfo}>
                          <Feather
                            name="alert-triangle"
                            size={12}
                            color={colors.yellow[500]}
                          />
                          <Text style={styles.alertText}>
                            {vehicle.alerts} alert
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[
                styles.addVehicleCard,
                isDark && styles.addVehicleCardDark,
              ]}
              onPress={() => navigation.navigate("AddVehicle")}
            >
              <Feather
                name="plus-circle"
                size={40}
                color={isDark ? colors.gray[400] : colors.gray[500]}
              />
              <Text
                style={[styles.addVehicleText, isDark && styles.textMutedLight]}
              >
                Add Vehicle
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Vehicle Details */}
          {vehicles.length > 0 ? (
            <Card style={styles.detailsCard}>
              <CardHeader style={styles.detailsCardHeader}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View>
                    <Text
                      style={[styles.detailsTitle, isDark && styles.textLight]}
                    >
                      {vehicles[selectedVehicle].name}
                    </Text>
                    <Text
                      style={[
                        styles.detailsMileage,
                        isDark && styles.textMutedLight,
                      ]}
                    >
                      {vehicles[selectedVehicle].mileage.toLocaleString()} miles
                    </Text>
                  </View>
                  <Feather
                    name="edit-2"
                    size={22}
                    color={isDark ? colors.white : colors.primary[500]}
                    style={{ marginLeft: 12 }}
                    onPress={() => {
                      const userId = firebaseService.getCurrentUser()?.uid;
                      if (userId) {
                        navigation.navigate("EditVehicleInfo", {
                          vehicle: vehicles[selectedVehicle],
                          userId,
                        });
                      }
                    }}
                  />
                </View>

                <View style={styles.detailsActions}>
                  {(() => {
                    const { deviceId, isConnected, plxDevice } =
                      bluetoothContext;
                    const vehicle = vehicles[selectedVehicle];
                    const vehicleIsConnected = isConnected; // && deviceId === vehicle.obdUUID;
                    if (vehicleIsConnected) {
                      return (
                        <Button
                          title="Sync Data"
                          onPress={syncVehicleDiagnostics}
                          variant="outline"
                          size="sm"
                          icon={
                            <Feather
                              name="refresh-cw"
                              size={14}
                              color={
                                isDark ? colors.white : colors.primary[500]
                              }
                            />
                          }
                        />
                      );
                    } else {
                      return (
                        <Button
                          title="Connect OBD-II"
                          onPress={() =>
                            navigation.navigate("ScanDevices" as never)
                          }
                          size="sm"
                          icon={
                            <Feather
                              name="upload-cloud"
                              size={14}
                              color={colors.white}
                            />
                          }
                        />
                      );
                    }
                  })()}
                </View>
              </CardHeader>

              <CardContent style={styles.detailsCardContent}>
                {/* Only show alert if NOT connected */}
                {showConnectAlert && (
                  <View
                    style={[styles.alertCard, isDark && styles.alertCardDark]}
                  >
                    <Feather
                      name="alert-triangle"
                      size={20}
                      color={colors.yellow[500]}
                    />
                    <View style={styles.alertCardContent}>
                      <Text
                        style={[
                          styles.alertCardTitle,
                          isDark && styles.textLight,
                        ]}
                      >
                        Connect OBD-II for Enhanced Features
                      </Text>
                      <Text
                        style={[
                          styles.alertCardText,
                          isDark && styles.textMutedLight,
                        ]}
                      >
                        Connect your vehicle to an OBD-II scanner to unlock
                        real-time diagnostics, predictive maintenance, and share
                        data with mechanics for better service.
                      </Text>
                      <Button
                        title="Connect Now"
                        onPress={() =>
                          navigation.navigate("ScanDevices" as never)
                        }
                        size="sm"
                        style={styles.alertCardButton}
                      />
                    </View>
                  </View>
                )}

                <View style={styles.infoCards}>
                  <Card style={styles.infoCard}>
                    <CardHeader style={styles.infoCardHeader}>
                      <Text
                        style={[
                          styles.infoCardTitle,
                          isDark && styles.textLight,
                        ]}
                      >
                        Vehicle Information
                      </Text>
                    </CardHeader>
                    <CardContent>
                      <View style={styles.infoGrid}>
                        <View style={styles.infoRow}>
                          <Text
                            style={[
                              styles.infoLabel,
                              isDark && styles.textMutedLight,
                            ]}
                          >
                            Year:
                          </Text>
                          <Text
                            style={[
                              styles.infoValue,
                              isDark && styles.textLight,
                            ]}
                          >
                            {vehicles[selectedVehicle]?.year || "-"}
                          </Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text
                            style={[
                              styles.infoLabel,
                              isDark && styles.textMutedLight,
                            ]}
                          >
                            Make:
                          </Text>
                          <Text
                            style={[
                              styles.infoValue,
                              isDark && styles.textLight,
                            ]}
                          >
                            {vehicles[selectedVehicle]?.make || "-"}
                          </Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text
                            style={[
                              styles.infoLabel,
                              isDark && styles.textMutedLight,
                            ]}
                          >
                            Model:
                          </Text>
                          <Text
                            style={[
                              styles.infoValue,
                              isDark && styles.textLight,
                            ]}
                          >
                            {vehicles[selectedVehicle]?.model || "-"}
                          </Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text
                            style={[
                              styles.infoLabel,
                              isDark && styles.textMutedLight,
                            ]}
                          >
                            Engine:
                          </Text>
                          <Text
                            style={[
                              styles.infoValue,
                              isDark && styles.textLight,
                            ]}
                          >
                            {vehicles[selectedVehicle]?.engine || "-"}
                          </Text>
                        </View>
                      </View>
                    </CardContent>
                  </Card>
                </View>
                <View style={styles.serviceInfo}>
                  <Card style={styles.infoCard}>
                    <CardHeader style={styles.infoCardHeader}>
                      <Text
                        style={[
                          styles.infoCardTitle,
                          isDark && styles.textLight,
                        ]}
                      >
                        Service Status
                      </Text>
                    </CardHeader>
                    <CardContent>
                      <View style={styles.serviceInfo}>
                        <View style={styles.serviceItem}>
                          <Text
                            style={[
                              styles.serviceLabel,
                              isDark && styles.textMutedLight,
                            ]}
                          >
                            Last Service
                          </Text>
                          <View style={styles.serviceDetail}>
                            <Feather
                              name="clock"
                              size={14}
                              color={
                                isDark ? colors.gray[400] : colors.gray[500]
                              }
                            />
                            <Text
                              style={[
                                styles.serviceText,
                                isDark && styles.textLight,
                              ]}
                            >
                              {vehicles[selectedVehicle].lastService}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.serviceItem}>
                          <Text
                            style={[
                              styles.serviceLabel,
                              isDark && styles.textMutedLight,
                            ]}
                          >
                            Next Recommended Service
                          </Text>
                          <View style={styles.serviceDetail}>
                            <Feather
                              name="calendar"
                              size={14}
                              color={
                                isDark ? colors.gray[400] : colors.gray[500]
                              }
                            />
                            <Text
                              style={[
                                styles.serviceText,
                                isDark && styles.textLight,
                              ]}
                            >
                              {vehicles[selectedVehicle].nextService}
                            </Text>
                          </View>
                        </View>

                        <Button
                          title="Schedule Service"
                          onPress={() => {}}
                          variant="outline"
                          icon={
                            <Feather
                              name="tool"
                              size={14}
                              color={
                                isDark ? colors.white : colors.primary[500]
                              }
                            />
                          }
                          style={styles.scheduleButton}
                        />
                      </View>
                    </CardContent>
                  </Card>
                </View>

                <View>
                  <Card style={styles.diagnosticsCard}>
                    <CardHeader style={styles.diagnosticsCardHeader}>
                      <Text
                        style={[
                          styles.diagnosticsTitle,
                          isDark && styles.textLight,
                        ]}
                      >
                        Diagnostic Summary
                      </Text>
                    </CardHeader>
                    <CardContent>
                      <View style={styles.diagnosticsGrid}>
                        {vehicles[selectedVehicle] &&
                        diagnosticsContext.diagnostics[
                          vehicles[selectedVehicle].id
                        ] ? (
                          <>
                            {/* Engine */}
                            <TouchableOpacity
                              style={[
                                styles.diagnosticItem,
                                isDark && styles.diagnosticItemDark,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.diagnosticLabel,
                                  isDark && styles.textMutedLight,
                                ]}
                              >
                                Engine
                              </Text>
                              <View style={styles.diagnosticValue}>
                                <Feather
                                  name="zap"
                                  size={16}
                                  color={colors.green[500]}
                                />
                                <Text
                                  style={[
                                    styles.diagnosticText,
                                    isDark && styles.textLight,
                                  ]}
                                >
                                  {diagnosticsContext.diagnostics[
                                    vehicles[selectedVehicle].id
                                  ].engineRunning
                                    ? "Running"
                                    : "Off"}
                                </Text>
                                <Feather
                                  name="chevron-right"
                                  size={16}
                                  color={
                                    isDark ? colors.gray[400] : colors.gray[500]
                                  }
                                />
                              </View>
                            </TouchableOpacity>
                            {/* Oil Life */}
                            <TouchableOpacity
                              style={[
                                styles.diagnosticItem,
                                isDark && styles.diagnosticItemDark,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.diagnosticLabel,
                                  isDark && styles.textMutedLight,
                                ]}
                              >
                                Oil Life
                              </Text>
                              <View style={styles.diagnosticValue}>
                                <Feather
                                  name="droplet"
                                  size={16}
                                  color={colors.yellow[500]}
                                />
                                <Text
                                  style={[
                                    styles.diagnosticText,
                                    isDark && styles.textLight,
                                  ]}
                                >
                                  {diagnosticsContext.diagnostics[
                                    vehicles[selectedVehicle].id
                                  ].milesSinceLastOilChange &&
                                  diagnosticsContext.diagnostics[
                                    vehicles[selectedVehicle].id
                                  ].milesBetweenOilChanges
                                    ? `${Math.max(
                                        0,
                                        100 -
                                          Math.round(
                                            (diagnosticsContext.diagnostics[
                                              vehicles[selectedVehicle].id
                                            ].milesSinceLastOilChange /
                                              diagnosticsContext.diagnostics[
                                                vehicles[selectedVehicle].id
                                              ].milesBetweenOilChanges) *
                                              100
                                          )
                                      )}%`
                                    : "-"}
                                </Text>
                                <Feather
                                  name="chevron-right"
                                  size={16}
                                  color={
                                    isDark ? colors.gray[400] : colors.gray[500]
                                  }
                                />
                              </View>
                            </TouchableOpacity>
                            {/* Battery */}
                            <TouchableOpacity
                              style={[
                                styles.diagnosticItem,
                                isDark && styles.diagnosticItemDark,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.diagnosticLabel,
                                  isDark && styles.textMutedLight,
                                ]}
                              >
                                Battery
                              </Text>
                              <View style={styles.diagnosticValue}>
                                <Feather
                                  name="battery"
                                  size={16}
                                  color={colors.green[500]}
                                />
                                <Text
                                  style={[
                                    styles.diagnosticText,
                                    isDark && styles.textLight,
                                  ]}
                                >
                                  {diagnosticsContext.diagnostics[
                                    vehicles[selectedVehicle].id
                                  ].battV
                                    ? `${
                                        diagnosticsContext.diagnostics[
                                          vehicles[selectedVehicle].id
                                        ].battV
                                      }V`
                                    : "-"}
                                </Text>
                                <Feather
                                  name="chevron-right"
                                  size={16}
                                  color={
                                    isDark ? colors.gray[400] : colors.gray[500]
                                  }
                                />
                              </View>
                            </TouchableOpacity>
                            {/* Brakes */}
                            <TouchableOpacity
                              style={[
                                styles.diagnosticItem,
                                isDark && styles.diagnosticItemDark,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.diagnosticLabel,
                                  isDark && styles.textMutedLight,
                                ]}
                              >
                                Brakes
                              </Text>
                              <View style={styles.diagnosticValue}>
                                <Feather
                                  name="alert-triangle"
                                  size={16}
                                  color={colors.yellow[500]}
                                />
                                <Text
                                  style={[
                                    styles.diagnosticText,
                                    isDark && styles.textLight,
                                  ]}
                                >
                                  {diagnosticsContext.diagnostics[
                                    vehicles[selectedVehicle].id
                                  ].milesSinceLastBrakeService &&
                                  diagnosticsContext.diagnostics[
                                    vehicles[selectedVehicle].id
                                  ].milesBetweenBrakeService
                                    ? `${Math.max(
                                        0,
                                        100 -
                                          Math.round(
                                            (diagnosticsContext.diagnostics[
                                              vehicles[selectedVehicle].id
                                            ].milesSinceLastBrakeService /
                                              diagnosticsContext.diagnostics[
                                                vehicles[selectedVehicle].id
                                              ].milesBetweenBrakeService) *
                                              100
                                          )
                                      )}%`
                                    : "-"}
                                </Text>
                                <Feather
                                  name="chevron-right"
                                  size={16}
                                  color={
                                    isDark ? colors.gray[400] : colors.gray[500]
                                  }
                                />
                              </View>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <Text style={styles.diagnosticText}>
                            No diagnostics available
                          </Text>
                        )}
                      </View>
                      <Button
                        title="View Full Diagnostics"
                        onPress={() => handleViewDiagnosticDetails(navigation)}
                        style={styles.viewDetailsButton}
                        icon={
                          <Feather
                            name="arrow-right"
                            size={16}
                            color={colors.white}
                          />
                        }
                      />
                    </CardContent>
                  </Card>
                </View>
              </CardContent>
            </Card>
          ) : (
            <Card style={styles.detailsCard}>
              <CardContent style={styles.emptyStateContainer}>
                <Feather
                  name="truck"
                  size={64}
                  color={isDark ? colors.gray[400] : colors.gray[500]}
                />
                <Text
                  style={[styles.emptyStateText, isDark && styles.textLight]}
                >
                  No vehicles found
                </Text>
                <Text
                  style={[
                    styles.emptyStateSubText,
                    isDark && styles.textMutedLight,
                  ]}
                >
                  Add your first vehicle to track maintenance and diagnostics
                </Text>
                <Button
                  title="Add Your First Vehicle"
                  onPress={() => {
                    // Add vehicle logic
                  }}
                  style={{ marginTop: 20 }}
                />
              </CardContent>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
    </>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[600],
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  vehicleListContainer: {
    paddingBottom: 16,
  },
  vehicleCard: {
    width: 250,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    padding: 16,
    marginRight: 16,
  },
  vehicleCardDark: {
    borderColor: colors.gray[700],
    backgroundColor: colors.gray[800],
  },
  selectedVehicleCard: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  selectedVehicleCardDark: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[900] + "30", // 30% opacity
  },
  vehicleCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[900],
  },
  connectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  connectedBadge: {
    backgroundColor: colors.green[500] + "20", // 20% opacity
  },
  notConnectedBadge: {
    backgroundColor: colors.gray[200],
  },
  connectionBadgeDark: {
    backgroundColor: colors.gray[700],
  },
  badgeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  connectedText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.green[500],
  },
  notConnectedText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.gray[600],
  },
  vehicleImage: {
    width: "100%",
    height: 100,
    marginBottom: 12,
  },
  vehicleStatus: {
    gap: 8,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 12,
    color: colors.gray[600],
  },
  statusValue: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusGood: {
    color: colors.green[500],
  },
  statusFair: {
    color: colors.yellow[500],
  },
  statusPoor: {
    color: colors.red[500],
  },
  statusUnknown: {
    color: colors.gray[500],
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  progressGood: {
    backgroundColor: colors.green[500],
  },
  progressFair: {
    backgroundColor: colors.yellow[500],
  },
  progressPoor: {
    backgroundColor: colors.red[500],
  },
  progressUnknown: {
    backgroundColor: colors.gray[400],
  },
  vehicleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  syncInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  syncText: {
    fontSize: 10,
    color: colors.gray[500],
  },
  alertInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  alertText: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.yellow[500],
  },
  addVehicleCard: {
    width: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  addVehicleCardDark: {
    borderColor: colors.gray[700],
    backgroundColor: colors.gray[800],
  },
  addVehicleText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[600],
    textAlign: "center",
  },
  detailsCard: {
    marginTop: 16,
  },
  detailsCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.gray[900],
  },
  detailsMileage: {
    fontSize: 14,
    color: colors.gray[600],
  },
  detailsActions: {
    flexDirection: "row",
    gap: 8,
  },
  detailsCardContent: {
    gap: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.gray[900],
    marginTop: 12,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: "center",
  },
  alertCard: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: colors.yellow[500] + "10", // 10% opacity
    borderWidth: 1,
    borderColor: colors.yellow[500] + "30", // 30% opacity
    borderRadius: 8,
    gap: 12,
    alignItems: "flex-start",
  },
  alertCardDark: {
    backgroundColor: colors.yellow[500] + "20", // 20% opacity
  },
  alertCardContent: {
    flex: 1,
    gap: 8,
  },
  alertCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[900],
  },
  alertCardText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  alertCardButton: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  infoCards: {
    flexDirection: "row",
    gap: 16,
  },
  infoCard: {
    flex: 1,
  },
  infoCardHeader: {
    paddingBottom: 8,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  infoGrid: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 12,
    color: colors.gray[600],
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.gray[900],
  },
  serviceInfo: {
    gap: 12,
  },
  serviceItem: {
    gap: 4,
  },
  serviceLabel: {
    fontSize: 12,
    color: colors.gray[600],
  },
  serviceDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  serviceText: {
    fontSize: 12,
    color: colors.gray[900],
  },
  scheduleButton: {
    marginTop: 8,
  },
  diagnosticsCard: {
    marginTop: 8,
  },
  diagnosticsCardHeader: {
    paddingBottom: 8,
  },
  diagnosticsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  diagnosticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  diagnosticItem: {
    width: "48%",
    padding: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  diagnosticItemDark: {
    borderColor: colors.gray[700],
    backgroundColor: colors.gray[800],
  },
  diagnosticLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 4,
  },
  diagnosticValue: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  diagnosticText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.gray[900],
  },
  viewDetailsButton: {
    marginTop: 16,
    alignSelf: "center",
  },
  textLight: {
    color: colors.white,
  },
  textMutedLight: {
    color: colors.gray[400],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
