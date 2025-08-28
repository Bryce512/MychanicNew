import React from "react";

import { View, Text, Button, StatusBar } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { styles } from "../theme/styles/Profile.styles";

const Profile = () => {
  const { user, signOut } = useAuth();
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" />
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.info}>Email: {user?.email || "N/A"}</Text>
        {/* Add more user info fields here if needed */}
        <Button title="Log Out" onPress={signOut} color="#d9534f" />
      </View>
    </>
  );
};

export default Profile;
