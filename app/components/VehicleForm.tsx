import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import type { KeyboardTypeOptions } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import firebaseService from "../services/firebaseService";

interface VehicleFormProps {
  initialData?: any;
  loading?: boolean;
  onSave: (form: any) => Promise<void>;
  onDelete?: () => Promise<void>;
  isEdit?: boolean;
}

const VEHICLE_FIELDS = [
  "year",
  "make",
  "model",
  "mileage",
  "name",
  "engine",
];

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
    placeholder: "We Suggest 5000 miles"
  },
  {
    key: "milesBetweenBrakeChanges",
    label: "Miles Between Brake Changes",
    keyboardType: "numeric",
    placeholder: "We Suggest 20000 miles"
  },
  {
    key: "batteryInstallDate",
    label: "Battery Install Date (YYYY-MM-DD)",
    keyboardType: "default",
    placeholder: "Found on a sticker on the battery"
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
    setSaving(true);
    try {
      // Parse numeric fields
      const updatedForm = {
        ...form,
        year: form.year ? parseInt(form.year, 10) : undefined,
        mileage: form.mileage ? parseInt(form.mileage, 10) : undefined,
      };

      // If image is a local URI, upload it, else use as is or default
      let imageUrl = DEFAULT_IMAGE;
      if (image) {
        if (image.startsWith("http")) {
          imageUrl = image;
        } else {
          // Need userId and vehicleId for path
          const currentUser = firebaseService.getCurrentUser();
          if (!currentUser) {
            Alert.alert("Error", "You must be signed in to upload an image.");
            setSaving(false);
            return;
          }
          // Use form.id if editing, otherwise generate a new id
          const vehicleId = (
            form.id ||
            form.name ||
            Date.now().toString()
          ).replace(/\s+/g, "_");
          imageUrl = await uploadImageAsync(currentUser.uid, vehicleId, image);
        }
      }
      updatedForm.image = imageUrl;

      // Save vehicle data
      await onSave(updatedForm);

      // Save maintenance config to /vehicle/vehicleId/maintConfigs
      const currentUser = firebaseService.getCurrentUser();
      const vehicleId = (form.id || form.name || Date.now().toString()).replace(
        /\s+/g,
        "_"
      );
      if (currentUser && vehicleId) {
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {isEdit ? "Edit Vehicle Info" : "Add Vehicle"}
      </Text>

      {/* Image Picker and Display */}
      <View style={styles.imageSection}>
        <TouchableOpacity
          onPress={pickImage}
          disabled={uploading || saving || loading}
        >
          <Image
            source={{ uri: image || DEFAULT_IMAGE }}
            style={styles.image}
            resizeMode="cover"
          />
          <Text style={styles.imageLabel}>
            {uploading ? "Uploading..." : "Tap to change image"}
          </Text>
        </TouchableOpacity>
        {uploading && <ActivityIndicator style={{ marginTop: 8 }} />}
      </View>

      {VEHICLE_FIELDS.map((field) => (
        <View key={field} style={styles.inputGroup}>
          <Text style={styles.label}>
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </Text>
          <TextInput
            style={styles.input}
            value={form[field]?.toString() || ""}
            onChangeText={(text) => handleChange(field, text)}
            keyboardType={
              field === "mileage" || field === "year" ? "numeric" : "default"
            }
          />
        </View>
      ))}
      {/* Maintenance Config Fields */}
      <Text style={[styles.label, { marginTop: 16, fontWeight: "bold" }]}>
        Maintenance Settings
      </Text>
      {MAINT_FIELDS.map((field) => (
        <View key={field.key} style={styles.inputGroup}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            style={styles.input}
            value={maintConfig[field.key]}
            onChangeText={(text) => handleMaintChange(field.key as string, text)}
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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  imageLabel: {
    marginTop: 8,
    color: "#888",
    fontSize: 14,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
});

export default VehicleForm;
