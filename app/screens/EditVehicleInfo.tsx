import React, { useState } from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import firebaseService from "../services/firebaseService";
import VehicleForm from "../components/VehicleForm";

export default function EditVehicleInfoScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "EditVehicleInfo">>();
  const { vehicle, userId } = route.params;
  const [loading, setLoading] = useState(false);

  const handleSave = async (form: any) => {
    setLoading(true);
    try {
      await firebaseService.updateVehicle(userId, vehicle.id, form);
      navigation.goBack();
    } catch (e) {
      alert("Failed to save vehicle info.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await firebaseService.deleteVehicle(userId, vehicle.id);
      navigation.goBack();
    } catch (e) {
      alert("Failed to delete vehicle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VehicleForm
      initialData={vehicle}
      loading={loading}
      onSave={handleSave}
      onDelete={handleDelete}
      isEdit={true}
    />
  );
}
