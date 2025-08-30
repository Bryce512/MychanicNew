import React from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ProfileForm from "../components/ProfileForm";
import { useAuth } from "../contexts/AuthContext";
import firebaseService from "../services/firebaseService";

const AddProfile = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const handleSaveProfile = async (profileData: any) => {
    if (!user) {
      Alert.alert("Error", "You must be signed in to create a profile.");
      return;
    }

    try {
      // Update the user profile in Firebase
      await firebaseService.updateUserProfile(user.uid, profileData);

      Alert.alert("Success", "Profile created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Home" as never),
        },
      ]);
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error; // Let ProfileForm handle the error display
    }
  };

  return (
    <ProfileForm
      onSave={handleSaveProfile}
      isEdit={false}
      title="Complete Your Profile"
    />
  );
};

export default AddProfile;
