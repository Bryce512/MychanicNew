import React, { useEffect, useState } from "react";
import { Alert, View, Text, ActivityIndicator, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ProfileForm from "../components/ProfileForm";
import { useAuth } from "../contexts/AuthContext";
import firebaseService from "../services/firebaseService";
import { styles } from "../theme/styles/Profile.styles";
import { colors } from "../theme/colors";

const EditProfile = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const fadeAnim = useState(new Animated.Value(0))[0];

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide after 2 seconds
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setToastVisible(false);
      });
    }, 2000);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        Alert.alert("Error", "You must be signed in to edit your profile.");
        navigation.goBack();
        return;
      }

      try {
        const userProfile = await firebaseService.getUserProfile(user.uid);
        // Format the phone number for display if it exists
        if (userProfile && userProfile.phone) {
          userProfile.phone = userProfile.phone.replace(/\D/g, ""); // Store as digits only
        }
        setProfile(userProfile || {});
      } catch (error) {
        console.error("Error fetching profile:", error);
        Alert.alert("Error", "Failed to load profile data.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, navigation]);

  const handleSaveProfile = async (profileData: any) => {
    if (!user) {
      Alert.alert("Error", "You must be signed in to update your profile.");
      return;
    }

    try {
      // Update the user profile in Firebase
      await firebaseService.updateUserProfile(user.uid, profileData);

      // Navigate back - the Profile screen will show the success message
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Failed to update profile", "error");
      throw error; // Let ProfileForm handle the error display
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ProfileForm
        initialData={profile}
        onSave={handleSaveProfile}
        isEdit={true}
        title="Edit Profile"
      />

      {/* Toast Banner */}
      {toastVisible && (
        <Animated.View
          style={{
            position: "absolute",
            top: 60,
            left: 20,
            right: 20,
            backgroundColor:
              toastType === "success" ? colors.primary[500] : "#d32f2f",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            opacity: fadeAnim,
            zIndex: 1000,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 14,
            }}
          >
            {toastMessage}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

export default EditProfile;
