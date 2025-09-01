import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { vehicleFormStyles } from "../theme/styles/VehicleForm.styles";
import type { KeyboardTypeOptions } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import firebaseService from "../services/firebaseService";

interface VehicleFormProps {
  initialData?: any;
  loading?: boolean;
  onSave: (form: any) => Promise<{ id: string | null } | undefined>;
  onDelete?: () => Promise<void>;
  isEdit?: boolean;
}

const VEHICLE_FIELDS = ["year", "make", "model", "mileage", "name", "engine"];
const REQUIRED_FIELDS = ["year", "make", "model", "mileage"];

const DEFAULT_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/fluid-tangent-405719.firebasestorage.app/o/public%2Fcar_default.png?alt=media&token=5232adad-a5f7-4b8c-be47-781163a7eaa1";

const MAINT_FIELDS: {
  key: keyof MaintConfig;
  label: string;
  keyboardType: KeyboardTypeOptions;
  placeholder: string;
}[] = [
  {
    key: "milesBetweenOilChanges",
    label: "Miles Between Oil Changes",
    keyboardType: "numeric",
    placeholder: "We Suggest 5000 miles",
  },
  {
    key: "milesBetweenBrakeChanges",
    label: "Miles Between Brake Changes",
    keyboardType: "numeric",
    placeholder: "We Suggest 20000 miles",
  },
  {
    key: "batteryInstallDate",
    label: "Battery Install Date (YYYY-MM-DD)",
    keyboardType: "default",
    placeholder: "Found on a sticker on the battery",
  },
];

type MaintConfig = {
  milesBetweenOilChanges: string;
  milesBetweenBrakeChanges: string;
  batteryInstallDate: string;
  [key: string]: string; // index signature for dynamic access
};

const VehicleForm: React.FC<VehicleFormProps> = ({
  initialData = {},
  loading = false,
  onSave,
  onDelete,
  isEdit = false,
}) => {
  const [form, setForm] = useState({ ...initialData });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<string | null>(initialData.image || null);
  const [uploading, setUploading] = useState(false);
  // Maintenance config state
  const [maintConfig, setMaintConfig] = useState<MaintConfig>({
    milesBetweenOilChanges:
      initialData.maintConfigs?.milesBetweenOilChanges?.toString() || "",
    milesBetweenBrakeChanges:
      initialData.maintConfigs?.milesBetweenBrakeChanges?.toString() || "",
    batteryInstallDate: initialData.maintConfigs?.batteryInstallDate || "",
  });

  const handleMaintChange = (key: string, value: string) => {
    setMaintConfig({ ...maintConfig, [key]: value });
  };

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const pickImage = async () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.7,
        includeBase64: false,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert(
            "Image Picker Error",
            response.errorMessage || "Unknown error"
          );
          return;
        }
        if (response.assets && response.assets.length > 0) {
          setImage(response.assets[0].uri || null);
        }
      }
    );
  };

  // Upload image to Firebase Storage and return download URL
  const uploadImageAsync = async (
    userId: string,
    vehicleId: string,
    uri: string
  ) => {
    setUploading(true);
    try {
      // Get file extension
      const extMatch = uri.match(/\.([a-zA-Z0-9]+)$/);
      const ext = extMatch ? extMatch[1] : "jpg";
      const url = await firebaseService.uploadVehicleImage(
        userId,
        vehicleId,
        uri,
        ext
      );
      return url;
    } catch (e) {
      Alert.alert(
        "Image Upload Failed",
        "Could not upload image. Using default image."
      );
      return DEFAULT_IMAGE;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    const newErrors: { [key: string]: string } = {};
    REQUIRED_FIELDS.forEach((field) => {
      if (!form[field] || form[field].toString().trim() === "") {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert("Missing Fields", "Please fill out all required fields.");
      return;
    } else {
      setErrors({});
    }
    setSaving(true);
    try {
      // Parse numeric fields
      const updatedForm = {
        ...form,
        year: form.year ? parseInt(form.year, 10) : undefined,
        mileage: form.mileage ? parseInt(form.mileage, 10) : undefined,
      };

      // Save vehicle data first to get the vehicle ID
      const vehicleResult = await onSave(updatedForm);
      const vehicleId = vehicleResult?.id;

      if (!vehicleId) {
        Alert.alert("Error", "Failed to save vehicle data.");
        setSaving(false);
        return;
      }

      // Now handle image upload with the actual vehicle ID
      let imageUrl = DEFAULT_IMAGE;
      if (image) {
        if (image.startsWith("http")) {
          imageUrl = image;
        } else {
          // Need userId for path
          const currentUser = firebaseService.getCurrentUser();
          if (!currentUser) {
            Alert.alert("Error", "You must be signed in to upload an image.");
            setSaving(false);
            return;
          }
          // Use the vehicle ID we just got
          imageUrl = await uploadImageAsync(currentUser.uid, vehicleId, image);
        }
      }

      // Update the vehicle with the image URL if it's different
      if (imageUrl !== updatedForm.image) {
        const currentUser = firebaseService.getCurrentUser();
        if (currentUser) {
          await firebaseService.updateVehicle(currentUser.uid, vehicleId, {
            ...updatedForm,
            image: imageUrl,
          });
        }
      }

      // Save maintenance config to /users/<userId>/vehicles/<vehicleId>/maintConfigs
      const currentUser = firebaseService.getCurrentUser();
      if (currentUser) {
        const maintConfigData = {
          milesBetweenOilChanges: maintConfig.milesBetweenOilChanges
            ? parseInt(maintConfig.milesBetweenOilChanges, 10)
            : undefined,
          milesBetweenBrakeChanges: maintConfig.milesBetweenBrakeChanges
            ? parseInt(maintConfig.milesBetweenBrakeChanges, 10)
            : undefined,
          batteryInstallDate: maintConfig.batteryInstallDate || undefined,
        };
        // Write to /users/<userId>/vehicles/<vehicleId>/maintConfigs
        const db = await import("@react-native-firebase/database");
        const ref = db.ref(
          db.getDatabase(),
          `users/${currentUser.uid}/vehicles/${vehicleId}/maintConfigs`
        );
        await db.set(ref, maintConfigData);
      }
    } catch (e) {
      console.error("Error saving vehicle:", e);
      Alert.alert("Failed to save vehicle info.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    Alert.alert(
      "Delete Vehicle",
      "Are you sure you want to delete this vehicle? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setSaving(true);
            try {
              await onDelete();
            } catch (e) {
              Alert.alert("Failed to delete vehicle.");
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={vehicleFormStyles.container}>

      {/* Image Picker and Display */}
      <View style={vehicleFormStyles.imageSection}>
        <TouchableOpacity
          onPress={pickImage}
          disabled={uploading || saving || loading}
        >
          <Image
            source={{ uri: image || DEFAULT_IMAGE }}
            style={vehicleFormStyles.image}
            resizeMode="cover"
          />
          <Text style={vehicleFormStyles.imageLabel}>
            {uploading ? "Uploading..." : "Tap to change image"}
          </Text>
        </TouchableOpacity>
        {uploading && <ActivityIndicator style={{ marginTop: 8 }} />}
      </View>

      {VEHICLE_FIELDS.map((field) => (
        <View key={field} style={vehicleFormStyles.inputGroup}>
          <Text style={vehicleFormStyles.label}>
            {field.charAt(0).toUpperCase() + field.slice(1)}
            {REQUIRED_FIELDS.includes(field) && (
              <Text style={{ color: "red" }}>*</Text>
            )}
          </Text>
          <TextInput
            style={vehicleFormStyles.input}
            value={form[field]?.toString() || ""}
            onChangeText={(text) => handleChange(field, text)}
            keyboardType={
              field === "mileage" || field === "year" ? "numeric" : "default"
            }
          />
          {errors[field] && (
            <Text style={{ color: "red", fontSize: 12 }}>{errors[field]}</Text>
          )}
        </View>
      ))}
      {/* Maintenance Config Fields */}
      <Text
        style={[vehicleFormStyles.label, { marginTop: 16, fontWeight: "bold" }]}
      >
        Maintenance Settings
      </Text>
      {MAINT_FIELDS.map((field) => (
        <View key={field.key} style={vehicleFormStyles.inputGroup}>
          <Text style={vehicleFormStyles.label}>{field.label}</Text>
          <TextInput
            style={vehicleFormStyles.input}
            value={maintConfig[field.key]}
            onChangeText={(text) =>
              handleMaintChange(field.key as string, text)
            }
            keyboardType={field.keyboardType}
            placeholder={field.placeholder}
          />
        </View>
      ))}
      <Button
        title={saving || loading ? "Saving..." : "Save"}
        onPress={handleSave}
        disabled={saving || loading || uploading}
      />
      {isEdit && onDelete && (
        <View style={{ marginTop: 24 }}>
          <Button
            title={saving || loading ? "Deleting..." : "Delete Vehicle"}
            color="#d32f2f"
            onPress={handleDelete}
            disabled={saving || loading}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default VehicleForm;
