"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  useColorScheme,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useBluetooth } from "../contexts/BluetoothContext";
import { useDiagnostics } from "../contexts/VehicleDiagnosticsContext";
import { obdDataFunctions } from "../services/obdService";
import Card, { CardContent, CardHeader } from "../components/Card";
import Button from "../components/Button";
import { colors } from "../theme/colors";
import firebaseService from "../services/firebaseService";

type RootStackParamList = {
  FullDiagnostics: { vehicleId: string };
};

type FullDiagnosticsRouteProp = RouteProp<
  RootStackParamList,
  "FullDiagnostics"
>;

export default function FullDiagnosticsScreen() {
  const navigation = useNavigation();
  const route = useRoute<FullDiagnosticsRouteProp>();
  const { vehicleId } = route.params;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bluetoothContext = useBluetooth();
  const diagnosticsContext = useDiagnostics();

  const [isScanningDTC, setIsScanningDTC] = useState(false);
  const [dtcCodes, setDtcCodes] = useState<string[]>([]);
  const [serviceHistory, setServiceHistory] = useState({
    lastOilChange: "",
    milesAtLastOilChange: "",
    lastBrakeService: "",
    milesAtLastBrakeService: "",
    lastTireService: "",
    milesAtLastTireService: "",
  });

  const [maintenanceConfig, setMaintenanceConfig] = useState({
    milesBetweenOilChanges: "",
    milesBetweenBrakeChanges: "",
    milesBetweenTireService: "",
  });

  const [currentMileage, setCurrentMileage] = useState(0);

  // Helper function to validate mileage input
  const validateMileageInput = (input: string): string => {
    const numValue = parseInt(input) || 0;
    if (numValue > currentMileage) {
      return (currentMileage - 1).toString();
    }
    return input;
  };

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Helper function to format date as MM/DD/YYYY
  const formatDate = (month: number, day: number, year: number) => {
    const monthStr = month.toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");
    return `${monthStr}/${dayStr}/${year}`;
  };

  // Helper function to parse date string back to components
  const parseDate = (dateString: string) => {
    if (!dateString) {
      const now = new Date();
      return {
        month: now.getMonth() + 1,
        day: now.getDate(),
        year: now.getFullYear(),
      };
    }
    const [month, day, year] = dateString.split("/").map(Number);
    return { month, day, year };
  };

  // Handle date picker open
  const openDatePicker = (fieldName: string, currentValue: string) => {
    setCurrentDateField(fieldName);
    const { month, day, year } = parseDate(currentValue);
    setSelectedMonth(month);
    setSelectedDay(day);
    setSelectedYear(year);
    setShowDatePicker(true);
  };

  // Handle date picker confirm
  const confirmDateSelection = () => {
    if (currentDateField) {
      const formattedDate = formatDate(
        selectedMonth,
        selectedDay,
        selectedYear
      );
      setServiceHistory((prev) => ({
        ...prev,
        [currentDateField]: formattedDate,
      }));
    }
    setShowDatePicker(false);
  };

  // Generate arrays for picker options
  const months = Array.from({ length: 12 }, (_, i) => ({
    label: new Date(0, i).toLocaleString("en", { month: "long" }),
    value: i + 1,
  }));

  const days = Array.from({ length: 31 }, (_, i) => ({
    label: (i + 1).toString(),
    value: i + 1,
  }));

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => ({
    label: (currentYear - i).toString(),
    value: currentYear - i,
  }));

  // Load existing service history
  useEffect(() => {
    const loadServiceHistory = async () => {
      try {
        const vehicle = await firebaseService.getVehicleById(vehicleId);
        if (vehicle) {
          const diagInfo = diagnosticsContext.diagnostics[vehicleId];
          setCurrentMileage(vehicle.mileage || 0);
          setServiceHistory({
            lastOilChange: vehicle.lastOilChange || "",
            milesAtLastOilChange:
              vehicle.milesAtLastOilChange?.toString() || "",
            lastBrakeService: vehicle.lastBrakeService || "",
            milesAtLastBrakeService:
              vehicle.milesAtLastBrakeService?.toString() || "",
            lastTireService: vehicle.lastTireService || "",
            milesAtLastTireService:
              vehicle.milesAtLastTireService?.toString() || "",
          });

          // Load maintenance config
          setMaintenanceConfig({
            milesBetweenOilChanges:
              vehicle.maintConfigs?.milesBetweenOilChanges?.toString() || "",
            milesBetweenBrakeChanges:
              vehicle.maintConfigs?.milesBetweenBrakeChanges?.toString() || "",
            milesBetweenTireService:
              vehicle.maintConfigs?.milesBetweenTireService?.toString() || "",
          });

          // Load DTC codes if available
          if (diagInfo?.dtcCodes) {
            setDtcCodes(diagInfo.dtcCodes);
          }
        }
      } catch (error) {
        console.error("Error loading service history:", error);
      }
    };

    if (vehicleId) {
      loadServiceHistory();
    }
  }, [vehicleId, diagnosticsContext.diagnostics]);

  // Scan for DTC codes
  const scanForDTCCodes = async () => {
    const { deviceId, isConnected, plxDevice } = bluetoothContext;

    if (!isConnected || !plxDevice) {
      Alert.alert(
        "No OBD-II Device Connected",
        "Please connect to an OBD-II device first."
      );
      return;
    }

    setIsScanningDTC(true);
    try {
      const codes = await obdDataFunctions.getDTCCodes(
        plxDevice,
        bluetoothContext.sendCommand,
        (message) => console.log(`[DTC SCAN] ${message}`)
      );

      if (codes && codes.length > 0) {
        setDtcCodes(codes);
        // Save DTC codes directly to vehicle document
        await firebaseService.updateVehicle(vehicleId, {
          dtcCodes: codes,
        });
        await diagnosticsContext.refreshDiagnostics();

        Alert.alert(
          "DTC Codes Found",
          `Found ${codes.length} diagnostic trouble code(s).`
        );
      } else {
        setDtcCodes([]);
        Alert.alert("No DTC Codes", "No diagnostic trouble codes found.");
      }
    } catch (error) {
      console.error("Error scanning DTC codes:", error);
      Alert.alert("Scan Failed", "Failed to scan for DTC codes.");
    } finally {
      setIsScanningDTC(false);
    }
  };

  // Save service history
  const saveServiceHistory = async (showAlerts = false) => {
    try {
      const currentUser = firebaseService.getCurrentUser();
      if (!currentUser) {
        Alert.alert("Error", "No user logged in");
        return;
      }

      // Get current vehicle data to calculate "miles since" values
      const currentVehicle = await firebaseService.getVehicleById(vehicleId);
      const currentMileage = currentVehicle?.mileage || 0;

      // Prepare maintenance config updates
      const maintConfigUpdates: any = {};

      if (maintenanceConfig.milesBetweenOilChanges) {
        maintConfigUpdates.milesBetweenOilChanges = parseInt(
          maintenanceConfig.milesBetweenOilChanges
        );
      }
      if (maintenanceConfig.milesBetweenBrakeChanges) {
        maintConfigUpdates.milesBetweenBrakeChanges = parseInt(
          maintenanceConfig.milesBetweenBrakeChanges
        );
      }
      if (maintenanceConfig.milesBetweenTireService) {
        maintConfigUpdates.milesBetweenTireService = parseInt(
          maintenanceConfig.milesBetweenTireService
        );
      }

      // Prepare main vehicle updates (dates and mileage at service)
      const vehicleUpdates: any = {};

      if (serviceHistory.lastOilChange) {
        vehicleUpdates.lastOilChange = serviceHistory.lastOilChange;
      }
      if (serviceHistory.milesAtLastOilChange) {
        vehicleUpdates.milesAtLastOilChange = parseInt(
          serviceHistory.milesAtLastOilChange
        );
      }
      if (serviceHistory.lastBrakeService) {
        vehicleUpdates.lastBrakeService = serviceHistory.lastBrakeService;
      }
      if (serviceHistory.milesAtLastBrakeService) {
        vehicleUpdates.milesAtLastBrakeService = parseInt(
          serviceHistory.milesAtLastBrakeService
        );
      }
      if (serviceHistory.lastTireService) {
        vehicleUpdates.lastTireService = serviceHistory.lastTireService;
      }
      if (serviceHistory.milesAtLastTireService) {
        vehicleUpdates.milesAtLastTireService = parseInt(
          serviceHistory.milesAtLastTireService
        );
      }

      // Save maintenance config if there are updates
      if (Object.keys(maintConfigUpdates).length > 0) {
        vehicleUpdates.maintConfigs = {
          ...(currentVehicle?.maintConfigs || {}),
          ...maintConfigUpdates,
        };
      }

      // Save to main vehicle document
      if (Object.keys(vehicleUpdates).length > 0) {
        await firebaseService.updateVehicle(vehicleId, vehicleUpdates);
      }

      // Refresh diagnostics context to recalculate dynamic values
      await diagnosticsContext.refreshDiagnostics();

      if (showAlerts) {
        Alert.alert(
          "Success",
          "Service history and maintenance configuration updated successfully."
        );
      }
    } catch (error) {
      console.error("Error saving service history:", error);
      if (showAlerts) {
        Alert.alert("Error", "Failed to save service history.");
      }
    }
  };

  const clearDTCCodes = async () => {
    Alert.alert(
      "Clear DTC Codes",
      "This will clear all diagnostic trouble codes from the vehicle's ECU. Only do this after fixing the issues. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              const { plxDevice } = bluetoothContext;
              if (plxDevice) {
                await obdDataFunctions.clearDTCCodes(
                  plxDevice,
                  bluetoothContext.sendCommand,
                  (message) => console.log(`[CLEAR DTC] ${message}`)
                );

                setDtcCodes([]);
                await firebaseService.updateVehicle(vehicleId, {
                  dtcCodes: [],
                });
                await diagnosticsContext.refreshDiagnostics();

                Alert.alert("Success", "DTC codes cleared successfully.");
              }
            } catch (error) {
              console.error("Error clearing DTC codes:", error);
              Alert.alert("Error", "Failed to clear DTC codes.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, isDark && styles.containerDark]}
      edges={["bottom", "left", "right"]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* DTC Codes Section */}
          <Card style={styles.sectionCard}>
            <CardHeader style={styles.cardHeader}>
              <Text style={[styles.cardTitle, isDark && styles.textLight]}>
                Diagnostic Trouble Codes (DTC)
              </Text>
            </CardHeader>
            <CardContent>
              <View style={styles.dtcSection}>
                <Button
                  title={isScanningDTC ? "Scanning..." : "Scan for DTC Codes"}
                  onPress={scanForDTCCodes}
                  loading={isScanningDTC}
                  icon={
                    <Feather name="search" size={16} color={colors.white} />
                  }
                  style={styles.scanButton}
                />

                {dtcCodes.length > 0 && (
                  <View style={styles.dtcList}>
                    <Text style={[styles.dtcTitle, isDark && styles.textLight]}>
                      Found {dtcCodes.length} code(s):
                    </Text>
                    {dtcCodes.map((code, index) => (
                      <View key={index} style={styles.dtcItem}>
                        <Text
                          style={[styles.dtcCode, isDark && styles.textLight]}
                        >
                          {code}
                        </Text>
                      </View>
                    ))}

                    <Button
                      title="Clear DTC Codes"
                      onPress={clearDTCCodes}
                      variant="outline"
                      size="sm"
                      style={styles.clearButton}
                    />
                  </View>
                )}

                {dtcCodes.length === 0 && !isScanningDTC && (
                  <Text style={[styles.noDtcText, isDark && styles.textMuted]}>
                    No DTC codes found. Tap "Scan for DTC Codes" to check for
                    issues.
                  </Text>
                )}
              </View>
            </CardContent>
          </Card>

          {/* Service History Section */}
          <Card style={styles.sectionCard}>
            <CardHeader style={styles.cardHeader}>
              <Text style={[styles.cardTitle, isDark && styles.textLight]}>
                Service History
              </Text>
            </CardHeader>
            <CardContent>
              <View style={styles.serviceSection}>
                {/* Oil Change */}
                <View style={styles.serviceItem}>
                  <Text
                    style={[styles.serviceLabel, isDark && styles.textLight]}
                  >
                    Last Oil Change
                  </Text>
                  <TouchableOpacity
                    style={[styles.dateInput, isDark && styles.dateInputDark]}
                    onPress={() =>
                      openDatePicker(
                        "lastOilChange",
                        serviceHistory.lastOilChange
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.dateText,
                        !serviceHistory.lastOilChange && styles.placeholderText,
                        isDark &&
                          serviceHistory.lastOilChange &&
                          styles.textLight,
                        isDark &&
                          !serviceHistory.lastOilChange &&
                          styles.placeholderTextDark,
                      ]}
                    >
                      {serviceHistory.lastOilChange || "Select Date"}
                    </Text>
                    <Feather
                      name="calendar"
                      size={16}
                      color={isDark ? colors.gray[400] : colors.gray[500]}
                    />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    placeholder="Mileage"
                    placeholderTextColor={
                      isDark ? colors.gray[400] : colors.gray[500]
                    }
                    value={serviceHistory.milesAtLastOilChange}
                    onChangeText={(text) => {
                      const validatedText = validateMileageInput(text);
                      setServiceHistory((prev) => ({
                        ...prev,
                        milesAtLastOilChange: validatedText,
                      }));
                    }}
                    onBlur={() => saveServiceHistory()}
                    keyboardType="numeric"
                    maxLength={currentMileage.toString().length + 1}
                  />
                </View>

                {/* Brake Service */}
                <View style={styles.serviceItem}>
                  <Text
                    style={[styles.serviceLabel, isDark && styles.textLight]}
                  >
                    Last Brake Service
                  </Text>
                  <TouchableOpacity
                    style={[styles.dateInput, isDark && styles.dateInputDark]}
                    onPress={() =>
                      openDatePicker(
                        "lastBrakeService",
                        serviceHistory.lastBrakeService
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.dateText,
                        !serviceHistory.lastBrakeService &&
                          styles.placeholderText,
                        isDark &&
                          serviceHistory.lastBrakeService &&
                          styles.textLight,
                        isDark &&
                          !serviceHistory.lastBrakeService &&
                          styles.placeholderTextDark,
                      ]}
                    >
                      {serviceHistory.lastBrakeService || "Select Date"}
                    </Text>
                    <Feather
                      name="calendar"
                      size={16}
                      color={isDark ? colors.gray[400] : colors.gray[500]}
                    />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    placeholder="Mileage"
                    placeholderTextColor={
                      isDark ? colors.gray[400] : colors.gray[500]
                    }
                    value={serviceHistory.milesAtLastBrakeService}
                    onChangeText={(text) => {
                      const validatedText = validateMileageInput(text);
                      setServiceHistory((prev) => ({
                        ...prev,
                        milesAtLastBrakeService: validatedText,
                      }));
                    }}
                    onBlur={() => saveServiceHistory()}
                    keyboardType="numeric"
                    maxLength={currentMileage.toString().length + 1}
                  />
                </View>

                {/* Tire Service */}
                <View style={styles.serviceItem}>
                  <Text
                    style={[styles.serviceLabel, isDark && styles.textLight]}
                  >
                    Last Tire Service
                  </Text>
                  <TouchableOpacity
                    style={[styles.dateInput, isDark && styles.dateInputDark]}
                    onPress={() =>
                      openDatePicker(
                        "lastTireService",
                        serviceHistory.lastTireService
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.dateText,
                        !serviceHistory.lastTireService &&
                          styles.placeholderText,
                        isDark &&
                          serviceHistory.lastTireService &&
                          styles.textLight,
                        isDark &&
                          !serviceHistory.lastTireService &&
                          styles.placeholderTextDark,
                      ]}
                    >
                      {serviceHistory.lastTireService || "Select Date"}
                    </Text>
                    <Feather
                      name="calendar"
                      size={16}
                      color={isDark ? colors.gray[400] : colors.gray[500]}
                    />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    placeholder="Mileage"
                    placeholderTextColor={
                      isDark ? colors.gray[400] : colors.gray[500]
                    }
                    value={serviceHistory.milesAtLastTireService}
                    onChangeText={(text) => {
                      const validatedText = validateMileageInput(text);
                      setServiceHistory((prev) => ({
                        ...prev,
                        milesAtLastTireService: validatedText,
                      }));
                    }}
                    onBlur={() => saveServiceHistory()}
                    keyboardType="numeric"
                    maxLength={currentMileage.toString().length + 1}
                  />
                </View>

                <Button
                  title="Save Service History"
                  onPress={() => saveServiceHistory(true)}
                  style={styles.saveButton}
                  icon={<Feather name="save" size={16} color={colors.white} />}
                />
              </View>
            </CardContent>
          </Card>

          {/* Maintenance Configuration Section */}
          <Card style={styles.sectionCard}>
            <CardHeader style={styles.cardHeader}>
              <Text style={[styles.cardTitle, isDark && styles.textLight]}>
                Maintenance Configuration
              </Text>
            </CardHeader>
            <CardContent>
              <View style={styles.serviceSection}>
                {/* Oil Change Interval */}
                <View style={styles.serviceItem}>
                  <Text
                    style={[styles.serviceLabel, isDark && styles.textLight]}
                  >
                    Oil Change Interval (miles)
                  </Text>
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    placeholder="5000"
                    placeholderTextColor={
                      isDark ? colors.gray[400] : colors.gray[500]
                    }
                    value={maintenanceConfig.milesBetweenOilChanges}
                    onChangeText={(text) =>
                      setMaintenanceConfig((prev) => ({
                        ...prev,
                        milesBetweenOilChanges: text,
                      }))
                    }
                    onBlur={() => saveServiceHistory()}
                    keyboardType="numeric"
                  />
                </View>

                {/* Brake Service Interval */}
                <View style={styles.serviceItem}>
                  <Text
                    style={[styles.serviceLabel, isDark && styles.textLight]}
                  >
                    Brake Service Interval (miles)
                  </Text>
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    placeholder="30000"
                    placeholderTextColor={
                      isDark ? colors.gray[400] : colors.gray[500]
                    }
                    value={maintenanceConfig.milesBetweenBrakeChanges}
                    onChangeText={(text) =>
                      setMaintenanceConfig((prev) => ({
                        ...prev,
                        milesBetweenBrakeChanges: text,
                      }))
                    }
                    onBlur={() => saveServiceHistory()}
                    keyboardType="numeric"
                  />
                </View>

                {/* Tire Service Interval */}
                <View style={styles.serviceItem}>
                  <Text
                    style={[styles.serviceLabel, isDark && styles.textLight]}
                  >
                    Tire Service Interval (miles)
                  </Text>
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    placeholder="5000"
                    placeholderTextColor={
                      isDark ? colors.gray[400] : colors.gray[500]
                    }
                    value={maintenanceConfig.milesBetweenTireService}
                    onChangeText={(text) =>
                      setMaintenanceConfig((prev) => ({
                        ...prev,
                        milesBetweenTireService: text,
                      }))
                    }
                    onBlur={() => saveServiceHistory()}
                    keyboardType="numeric"
                  />
                </View>

                <Button
                  title="Save Maintenance Config"
                  onPress={() => saveServiceHistory(true)}
                  style={styles.saveButton}
                  icon={
                    <Feather name="settings" size={16} color={colors.white} />
                  }
                />
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>

      {/* Custom Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, isDark && styles.modalContentDark]}
          >
            <Text style={[styles.modalTitle, isDark && styles.textLight]}>
              Select Date
            </Text>

            <View style={styles.pickerContainer}>
              {/* Month Picker */}
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, isDark && styles.textLight]}>
                  Month
                </Text>
                <ScrollView style={styles.pickerScroll}>
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month.value}
                      style={[
                        styles.pickerItem,
                        selectedMonth === month.value &&
                          styles.pickerItemSelected,
                        isDark && styles.pickerItemDark,
                        selectedMonth === month.value &&
                          isDark &&
                          styles.pickerItemSelectedDark,
                      ]}
                      onPress={() => setSelectedMonth(month.value)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedMonth === month.value &&
                            styles.pickerItemTextSelected,
                          isDark &&
                            selectedMonth === month.value &&
                            styles.pickerItemTextSelectedDark,
                        ]}
                      >
                        {month.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Day Picker */}
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, isDark && styles.textLight]}>
                  Day
                </Text>
                <ScrollView style={styles.pickerScroll}>
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day.value}
                      style={[
                        styles.pickerItem,
                        selectedDay === day.value && styles.pickerItemSelected,
                        isDark && styles.pickerItemDark,
                        selectedDay === day.value &&
                          isDark &&
                          styles.pickerItemSelectedDark,
                      ]}
                      onPress={() => setSelectedDay(day.value)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedDay === day.value &&
                            styles.pickerItemTextSelected,
                          isDark &&
                            selectedDay === day.value &&
                            styles.pickerItemTextSelectedDark,
                        ]}
                      >
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year Picker */}
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, isDark && styles.textLight]}>
                  Year
                </Text>
                <ScrollView style={styles.pickerScroll}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year.value}
                      style={[
                        styles.pickerItem,
                        selectedYear === year.value &&
                          styles.pickerItemSelected,
                        isDark && styles.pickerItemDark,
                        selectedYear === year.value &&
                          isDark &&
                          styles.pickerItemSelectedDark,
                      ]}
                      onPress={() => setSelectedYear(year.value)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedYear === year.value &&
                            styles.pickerItemTextSelected,
                          isDark &&
                            selectedYear === year.value &&
                            styles.pickerItemTextSelectedDark,
                        ]}
                      >
                        {year.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowDatePicker(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Confirm"
                onPress={confirmDateSelection}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  containerDark: {
    backgroundColor: colors.gray[900],
  },
  content: {
    padding: 16,
  },
  sectionCard: {
    marginBottom: 16,
  },
  cardHeader: {
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
  },
  textLight: {
    color: colors.white,
  },
  textMuted: {
    color: colors.gray[400],
  },
  dtcSection: {
    gap: 16,
  },
  scanButton: {
    marginBottom: 16,
  },
  dtcList: {
    gap: 12,
  },
  dtcTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
  },
  dtcItem: {
    backgroundColor: colors.red[500] + "20", // 20% opacity
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.red[500] + "40", // 40% opacity
  },
  dtcCode: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.red[500],
    fontFamily: "monospace",
  },
  clearButton: {
    marginTop: 8,
  },
  noDtcText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: "center",
    fontStyle: "italic",
  },
  serviceSection: {
    gap: 16,
  },
  serviceItem: {
    gap: 8,
  },
  serviceLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.gray[900],
  },
  inputDark: {
    borderColor: colors.gray[600],
    backgroundColor: colors.gray[800],
    color: colors.white,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateInputDark: {
    borderColor: colors.gray[600],
    backgroundColor: colors.gray[800],
  },
  dateText: {
    fontSize: 16,
    color: colors.gray[900],
  },
  placeholderText: {
    color: colors.gray[500],
  },
  placeholderTextDark: {
    color: colors.gray[400],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalContentDark: {
    backgroundColor: colors.gray[800],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.gray[900],
    textAlign: "center",
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: "center",
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
    marginBottom: 10,
  },
  pickerScroll: {
    height: 150,
    width: "100%",
  },
  pickerItem: {
    padding: 10,
    marginVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.gray[100],
    alignItems: "center",
  },
  pickerItemSelected: {
    backgroundColor: colors.primary[500],
  },
  pickerItemDark: {
    backgroundColor: colors.gray[700],
  },
  pickerItemSelectedDark: {
    backgroundColor: colors.primary[600],
  },
  pickerItemText: {
    fontSize: 16,
    color: colors.gray[900],
  },
  pickerItemTextSelected: {
    color: colors.white,
    fontWeight: "600",
  },
  pickerItemTextSelectedDark: {
    color: colors.white,
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  saveButton: {
    marginTop: 16,
  },
});
