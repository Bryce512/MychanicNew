"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { getDatabase, ref, get } from "@react-native-firebase/database";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Feather } from "@expo/vector-icons";
import Button from "../components/Button";
import Card, { CardContent, CardHeader } from "../components/Card";
import { colors } from "../theme/colors";
import * as ImagePicker from "expo-image-picker";
import firebaseService from "../services/firebaseService";

export default function AddVehicleScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Form state
  const [vehicleName, setVehicleName] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [isOBDConnected, setIsOBDConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMakePicker, setShowMakePicker] = useState(false);

  // Available makes and models (could fetch from Firebase)
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  // Input validation
  const [errors, setErrors] = useState<{
    name?: string;
    make?: string;
    model?: string;
    year?: string;
    mileage?: string;
  }>({});

  useEffect(() => {
    // Fetch available makes from Firebase
    const fetchVehicleInfo = async () => {
      try {
        const database = getDatabase();
        const vehicleInfoRef = ref(database, "vehicle_info/makes");
        const snapshot = await get(vehicleInfoRef);

        if (snapshot.exists()) {
          const makesData = snapshot.val();
          setMakes(Object.keys(makesData));
        }
      } catch (error) {
        console.error("Error fetching vehicle makes:", error);
      }
    };

    fetchVehicleInfo();
  }, []);

  // Update models when make changes
  useEffect(() => {
    if (make) {
      const fetchModels = async () => {
        try {
          const database = getDatabase();
          const modelsRef = ref(database, `vehicle_info/makes/${make}/models`);
          const snapshot = await get(modelsRef);

          if (snapshot.exists()) {
            setModels(snapshot.val());
          } else {
            setModels([]);
          }
        } catch (error) {
          console.error("Error fetching models for make:", error);
          setModels([]);
        }
      };

      fetchModels();
    } else {
      setModels([]);
    }
  }, [make]);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "You need to grant gallery permissions to upload a vehicle image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      // In a real app, you would upload this to Firebase Storage
      // For now, we'll just set it directly
    }
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      make?: string;
      model?: string;
      year?: string;
      mileage?: string;
    } = {};

    if (!vehicleName.trim()) {
      newErrors.name = "Vehicle name is required";
    }

    if (!make) {
      newErrors.make = "Make is required";
    }

    if (!model) {
      newErrors.model = "Model is required";
    }

    if (!year) {
      newErrors.year = "Year is required";
    } else if (
      !/^\d{4}$/.test(year) ||
      parseInt(year) < 1900 ||
      parseInt(year) > new Date().getFullYear() + 1
    ) {
      newErrors.year = "Please enter a valid year";
    }

    if (!mileage) {
      newErrors.mileage = "Mileage is required";
    } else if (!/^\d+$/.test(mileage)) {
      newErrors.mileage = "Please enter a valid mileage";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const currentUser = firebaseService.getCurrentUser();

      if (!currentUser) {
        Alert.alert("Error", "You must be signed in to add a vehicle.");
        setLoading(false);
        return;
      }

      // Prepare vehicle data
      const vehicleData = {
        name: vehicleName.trim(),
        make: make,
        model: model,
        year: parseInt(year),
        mileage: parseInt(mileage),
        image: image || "https://example.com/default-car.jpg", // In a real app, upload to Firebase Storage
        status: "Good", // Default value
        obd: isOBDConnected,
        progress: 100, // Default value
        lastService: "3 months ago", // Default or empty
        nextService: "In 2 months", // Default or calculated
        alerts: 0, // Default value
      };

      // Add vehicle to Firebase
      await firebaseService.addVehicle(currentUser.uid, vehicleData);

      Alert.alert("Success", "Vehicle added successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error adding vehicle:", error);
      Alert.alert("Error", "Failed to add vehicle. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Convert your makes array to the format required
  const makeOptions = makes.map((make) => ({ key: make, value: make }));

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Feather
                name="arrow-left"
                size={24}
                color={isDark ? colors.white : colors.gray[900]}
              />
            </TouchableOpacity>

            <Text style={[styles.title, isDark && styles.textLight]}>
              Add New Vehicle
            </Text>
          </View>

          <View style={styles.content}>
            <Card>
              <CardHeader>
                <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
                  Vehicle Information
                </Text>
              </CardHeader>

              <CardContent style={styles.formContainer}>
                {/* Vehicle Name */}
                <View style={styles.formGroup}>
                  <Text style={[styles.label, isDark && styles.textMutedLight]}>
                    Vehicle Name
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      isDark && styles.inputDark,
                      errors.name && styles.inputError,
                    ]}
                    value={vehicleName}
                    onChangeText={setVehicleName}
                    placeholder="E.g. My Bronco"
                    placeholderTextColor={
                      isDark ? colors.gray[600] : colors.gray[400]
                    }
                  />
                  {errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}
                </View>

                {/* Vehicle Image */}
                <View style={styles.formGroup}>
                  <Text style={[styles.label, isDark && styles.textMutedLight]}>
                    Vehicle Image
                  </Text>
                  <TouchableOpacity
                    onPress={pickImage}
                    style={[
                      styles.imagePickerButton,
                      isDark && styles.imagePickerButtonDark,
                    ]}
                  >
                    {image ? (
                      <Image
                        source={{ uri: image }}
                        style={styles.vehicleImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Feather
                          name="camera"
                          size={32}
                          color={isDark ? colors.gray[400] : colors.gray[500]}
                        />
                        <Text
                          style={[
                            styles.imagePlaceholderText,
                            isDark && styles.textMutedLight,
                          ]}
                        >
                          Tap to upload image
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Make */}
                <View style={styles.formGroup}>
                  <Text style={[styles.label, isDark && styles.textMutedLight]}>
                    Make
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.input,
                      isDark && styles.inputDark,
                      errors.make && styles.inputError,
                    ]}
                    onPress={() => setShowMakePicker(true)}
                  >
                    <Text
                      style={{
                        color: isDark ? colors.white : colors.gray[900],
                      }}
                    >
                      {make || "Select Make"}
                    </Text>
                  </TouchableOpacity>

                  {/* Make Picker Modal */}
                  <Modal
                    visible={showMakePicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowMakePicker(false)}
                  >
                    <View style={styles.modalOverlay}>
                      <View
                        style={[
                          styles.modalContent,
                          isDark && styles.modalContentDark,
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalTitle,
                            isDark && styles.textLight,
                          ]}
                        >
                          Select Make
                        </Text>
                        <FlatList
                          data={makes}
                          keyExtractor={(item) => item}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              style={styles.modalItem}
                              onPress={() => {
                                setMake(item);
                                setModel("");
                                setShowMakePicker(false);
                              }}
                            >
                              <Text style={isDark ? styles.textLight : null}>
                                {item}
                              </Text>
                            </TouchableOpacity>
                          )}
                        />
                        <Button
                          title="Cancel"
                          onPress={() => setShowMakePicker(false)}
                          variant="outline"
                        />
                      </View>
                    </View>
                  </Modal>

                  {errors.make && (
                    <Text style={styles.errorText}>{errors.make}</Text>
                  )}
                </View>


                {/* Year */}
                <View style={styles.formGroup}>
                  <Text style={[styles.label, isDark && styles.textMutedLight]}>
                    Year
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      isDark && styles.inputDark,
                      errors.year && styles.inputError,
                    ]}
                    value={year}
                    onChangeText={setYear}
                    placeholder="E.g. 2023"
                    placeholderTextColor={
                      isDark ? colors.gray[600] : colors.gray[400]
                    }
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  {errors.year && (
                    <Text style={styles.errorText}>{errors.year}</Text>
                  )}
                </View>

                {/* Mileage */}
                <View style={styles.formGroup}>
                  <Text style={[styles.label, isDark && styles.textMutedLight]}>
                    Current Mileage
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      isDark && styles.inputDark,
                      errors.mileage && styles.inputError,
                    ]}
                    value={mileage}
                    onChangeText={setMileage}
                    placeholder="E.g. 35000"
                    placeholderTextColor={
                      isDark ? colors.gray[600] : colors.gray[400]
                    }
                    keyboardType="numeric"
                  />
                  {errors.mileage && (
                    <Text style={styles.errorText}>{errors.mileage}</Text>
                  )}
                </View>

                {/* OBD Connection toggle */}
                <View style={styles.formGroup}>
                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        isOBDConnected && styles.checkboxChecked,
                        isDark && styles.checkboxDark,
                        isOBDConnected && isDark && styles.checkboxCheckedDark,
                      ]}
                      onPress={() => setIsOBDConnected(!isOBDConnected)}
                    >
                      {isOBDConnected && (
                        <Feather
                          name="check"
                          size={16}
                          color={isDark ? colors.black : colors.white}
                        />
                      )}
                    </TouchableOpacity>
                    <Text
                      style={[styles.checkboxLabel, isDark && styles.textLight]}
                    >
                      This vehicle is connected to an OBD-II device
                    </Text>
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => navigation.goBack()}
                    style={styles.cancelButton}
                  />
                  <Button
                    title={loading ? "Adding..." : "Add Vehicle"}
                    onPress={handleSubmit}
                    disabled={loading}
                    icon={
                      loading ? undefined : (
                        <Feather name="plus" size={16} color={colors.white} />
                      )
                    }
                  />
                </View>
              </CardContent>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.gray[900],
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
  },
  formContainer: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[700],
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
    borderColor: colors.gray[700],
    backgroundColor: colors.gray[800],
    color: colors.white,
  },
  inputError: {
    borderColor: colors.red[500],
  },
  errorText: {
    color: colors.red[500],
    fontSize: 12,
    marginTop: 4,
  },
  imagePickerButton: {
    width: "100%",
    height: 180,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  imagePickerButtonDark: {
    borderColor: colors.gray[700],
    backgroundColor: colors.gray[800],
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.gray[500],
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  pickerContainerDark: {
    borderColor: colors.gray[700],
    backgroundColor: colors.gray[800],
  },
  picker: {
    height: 50,
    width: "100%",
    color: colors.gray[900],
  },
  pickerDark: {
    color: colors.white,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.primary[500],
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  checkboxDark: {
    borderColor: colors.primary[400],
    backgroundColor: colors.gray[800],
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
  },
  checkboxCheckedDark: {
    backgroundColor: colors.primary[400],
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.gray[900],
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
  },
  textLight: {
    color: colors.white,
  },
  textMutedLight: {
    color: colors.gray[400],
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "80%",
    borderRadius: 8,
    padding: 20,
    backgroundColor: colors.white,
  },
  modalContentDark: {
    backgroundColor: colors.gray[800],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
});
