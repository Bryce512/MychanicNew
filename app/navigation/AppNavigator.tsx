"use client";
import React from "react";
import { StatusBar } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../components/theme-provider";

// Screens
import HomeScreen from "../screens/Home";
import FindMechanicsScreen from "../screens/FindMechanics";
import VehicleProfilesScreen from "../screens/VehicleProfiles";
import AddVehicleScreen from "../screens/AddVehicle";
import BookAppointmentScreen from "../screens/BookAppointment";
import ProfileScreen from "../screens/Profile";
import DiagnosticsDetailScreen from "../screens/dtcDetails";
import ScanDevicesScreen from "../screens/ScanDevices";
import LoginScreen from "../screens/Login";
import SignupScreen from "../screens/Signup";
import EditVehicleInfoScreen from "../screens/EditVehicleInfo";

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Signup: undefined;
  BookAppointment: { mechanicId: number };
  DiagnosticsDetail: { userId: number; carId: number; diagnosticCode: string };
  ScanDevices: undefined;
  Profile: undefined;
  EditVehicleInfo: { vehicle: any; userId: string };
  AddVehicle: undefined;
  FindMechanics: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const VehiclesStack = createNativeStackNavigator();

function VehiclesStackScreen() {
  const { colors } = useTheme();

  return (
    <VehiclesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary[500] },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
      }}
    >
      <VehiclesStack.Screen
        name="VehicleProfiles"
        component={VehicleProfilesScreen}
        options={{ title: "My Vehicles" }}
      />
      <VehiclesStack.Screen
        name="AddVehicle"
        component={AddVehicleScreen}
        options={{ title: "Add Vehicle" }}
      />
      <VehiclesStack.Screen
        name="EditVehicleInfo"
        component={EditVehicleInfoScreen}
        options={{ title: "Edit Vehicle Info" }}
      />
    </VehiclesStack.Navigator>
  );
}

function MainTabs() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: isDark ? colors.gray[400] : colors.gray[500],
        tabBarStyle: {
          backgroundColor: isDark ? colors.gray[900] : colors.white,
          borderTopColor: isDark ? colors.gray[800] : colors.gray[200],
        },
        headerShown: false, // hide tab navigator header; handled by nested stacks
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Vehicles"
        component={VehiclesStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="truck" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FindMechanics"
        component={FindMechanicsScreen}
        options={{
          title: "Find Mechanics",
          tabBarIcon: ({ color, size }) => (
            <Feather name="search" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

import { View, ActivityIndicator } from "react-native";

export default function AppNavigator() {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();

  // Debug logging
  console.log(
    "AppNavigator render - user:",
    user ? "logged in" : "not logged in",
    "isLoading:",
    isLoading
  );

  if (isLoading) {
    console.log("Showing loading screen");
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.white,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary[500] },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }} // header handled by nested stacks
          />
          <Stack.Screen
            name="BookAppointment"
            component={BookAppointmentScreen}
            options={{ title: "Book Appointment" }}
          />
          <Stack.Screen
            name="DiagnosticsDetail"
            component={DiagnosticsDetailScreen}
            options={{ title: "Diagnostic Details" }}
          />
          <Stack.Screen name="ScanDevices" component={ScanDevicesScreen} />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: "Profile" }}
          />
          <Stack.Screen
            name="EditVehicleInfo"
            component={EditVehicleInfoScreen}
            options={{ title: "Edit Vehicle Info" }}
          />
          <Stack.Screen
            name="AddVehicle"
            component={AddVehicleScreen}
            options={{ title: "Add Vehicle" }}
          />
          <Stack.Screen
            name="FindMechanics"
            component={FindMechanicsScreen}
            options={{ title: "Find Mechanics" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Login" }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ title: "Sign Up" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
