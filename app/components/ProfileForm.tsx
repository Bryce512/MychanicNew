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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { signupStyles } from "../theme/styles/Signup.styles";

interface ProfileFormProps {
  initialData?: any;
  loading?: boolean;
  onSave: (profileData: any) => Promise<void>;
  isEdit?: boolean;
  title?: string;
}

const PROFILE_FIELDS = [
  {
    key: "name",
    label: "Full Name",
    placeholder: "Enter your full name",
    icon: "user",
    required: true,
  },
  {
    key: "phone",
    label: "Phone Number",
    placeholder: "Enter your phone number",
    icon: "phone",
    keyboardType: "phone-pad" as const,
    required: false,
  },
  {
    key: "address",
    label: "Address",
    placeholder: "Enter your address",
    icon: "map-pin",
    required: false,
  },
  {
    key: "city",
    label: "City",
    placeholder: "Enter your city",
    icon: "map",
    required: false,
  },
  {
    key: "state",
    label: "State",
    placeholder: "Enter your state",
    icon: "navigation",
    required: false,
  },
  {
    key: "zipCode",
    label: "Zip Code",
    placeholder: "Enter your zip code",
    icon: "hash",
    keyboardType: "numeric" as const,
    required: false,
  },
];

const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData = {},
  loading = false,
  onSave,
  isEdit = false,
  title,
}) => {
  const [form, setForm] = useState({ ...initialData });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);

  // Helper function to format phone number for display
  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return "";
    // Remove all non-digits
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone; // Return as-is if not 10 digits
  };

  // Helper function to clean phone number for storage (digits only)
  const cleanPhoneForStorage = (phone: string) => {
    if (!phone) return "";
    return phone.replace(/\D/g, "");
  };

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors({ ...errors, [key]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    PROFILE_FIELDS.forEach((field) => {
      if (
        field.required &&
        (!form[field.key] || form[field.key].toString().trim() === "")
      ) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    // Special validation for phone number
    if (form.phone && form.phone.trim()) {
      const digits = cleanPhoneForStorage(form.phone);
      if (digits.length > 0 && digits.length !== 10) {
        newErrors.phone = "Phone number must be 10 digits";
      }
    }

    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert("Missing Fields", "Please fill out all required fields.");
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      // Clean phone number before saving (store only digits)
      const formToSave = {
        ...form,
        phone: form.phone ? cleanPhoneForStorage(form.phone) : "",
      };
      await onSave(formToSave);
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={signupStyles.container}
      edges={["bottom", "left", "right"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={signupStyles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={signupStyles.scrollContainer}>
          <View style={signupStyles.logoContainer}>
            <Feather name="user" size={40} color={colors.primary[500]} />
            <Text style={signupStyles.logoText}>
              {title || (isEdit ? "Edit Profile" : "Complete Profile")}
            </Text>
          </View>

          <Text style={signupStyles.title}>
            {isEdit ? "Update Your Information" : "Tell us about yourself"}
          </Text>
          <Text style={signupStyles.subtitle}>
            {isEdit
              ? "Update your profile information below"
              : "Complete your profile to get the best experience"}
          </Text>

          <View style={signupStyles.form}>
            {PROFILE_FIELDS.map((field) => (
              <View key={field.key} style={signupStyles.inputContainer}>
                <Text style={signupStyles.inputLabel}>
                  {field.label}{" "}
                  {field.required && <Text style={{ color: "red" }}>*</Text>}
                </Text>
                <View style={signupStyles.inputWrapper}>
                  <Feather
                    name={field.icon as any}
                    size={18}
                    color={colors.gray[500]}
                    style={signupStyles.inputIcon}
                  />
                  <TextInput
                    style={[
                      signupStyles.input,
                      { paddingLeft: 40 },
                      errors[field.key] && { borderColor: "red" },
                    ]}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.gray[500]}
                    value={
                      field.key === "phone" && form[field.key]
                        ? formatPhoneDisplay(form[field.key])
                        : form[field.key]?.toString() || ""
                    }
                    onChangeText={(text) => handleChange(field.key, text)}
                    keyboardType={field.keyboardType || "default"}
                    autoCapitalize={field.key === "email" ? "none" : "words"}
                  />
                </View>
                {errors[field.key] && (
                  <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                    {errors[field.key]}
                  </Text>
                )}
              </View>
            ))}

            <Button
              title={saving || loading ? "Saving..." : "Save Profile"}
              onPress={handleSave}
              disabled={saving || loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileForm;
