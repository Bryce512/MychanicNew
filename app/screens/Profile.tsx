import React, { useContext } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth } from "../contexts/AuthContext";

const Profile = () => {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.info}>Email: {user?.email || "N/A"}</Text>
      {/* Add more user info fields here if needed */}
      <Button title="Log Out" onPress={signOut} color="#d9534f" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    marginBottom: 40,
  },
});

export default Profile;
