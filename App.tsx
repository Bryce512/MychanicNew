import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./app/contexts/AuthContext";
import { ThemeProvider } from "./app/components/theme-provider";
import { View, Text } from "react-native";
import AppNavigator from "./app/navigation/AppNavigator";
import { BluetoothProvider } from "./app/contexts/BluetoothContext";
import { DiagnosticsProviderWrapper } from "./app/contexts/VehicleDiagnosticsContext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BluetoothProvider>
          <DiagnosticsProviderWrapper>
            <NavigationContainer>
              <StatusBar style="auto" />
              <AppNavigator />
            </NavigationContainer>
          </DiagnosticsProviderWrapper>
        </BluetoothProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
