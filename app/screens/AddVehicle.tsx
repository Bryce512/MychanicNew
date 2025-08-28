import React, { useState } from "react";
import { StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import firebaseService from "../services/firebaseService";
import VehicleForm from "../components/VehicleForm";

export default function AddVehicleScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleSave = async (form: any) => {
    setLoading(true);
    try {
      const currentUser = firebaseService.getCurrentUser();
      if (!currentUser) {
        alert("You must be signed in to add a vehicle.");
        setLoading(false);
        return;
      }
      await firebaseService.addVehicle(currentUser.uid, form);
      navigation.goBack();
    } catch (e) {
      alert("Failed to add vehicle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <VehicleForm onSave={handleSave} loading={loading} isEdit={false} />
    </>
  );
  // StatusBar for all screens except Home
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" />
      {/* ...existing code... */}
    </>
  );
}
