import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../components/theme-provider";
import Button from "../components/Button";
import Card from "../components/Card";
import { RootStackParamList } from "../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MechanicDashboard() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.gray[900] : colors.gray[50],
      paddingTop: 0,
    },
    content: {
      flex: 1,
      padding: 0,
    },
    statsContainer: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      padding: 16,
      alignItems: "center",
    },
    statNumber: {
      fontSize: 24,
      fontWeight: "bold",
      color: isDark ? colors.white : colors.gray[900],
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: isDark ? colors.gray[400] : colors.gray[600],
      textAlign: "center",
    },
    quickActionsTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDark ? colors.white : colors.gray[900],
      marginBottom: 16,
    },
    quickActionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 24,
    },
    quickActionCard: {
      width: "48%",
      padding: 16,
      alignItems: "center",
      backgroundColor: isDark ? colors.gray[800] : colors.white,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? colors.gray[700] : colors.gray[200],
    },
    quickActionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary[500],
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    quickActionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? colors.white : colors.gray[900],
      textAlign: "center",
      marginBottom: 4,
    },
    quickActionDescription: {
      fontSize: 12,
      color: isDark ? colors.gray[400] : colors.gray[600],
      textAlign: "center",
    },
    recentActivityTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDark ? colors.white : colors.gray[900],
      marginBottom: 16,
    },
    activityItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: isDark ? colors.gray[800] : colors.white,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? colors.gray[700] : colors.gray[200],
      marginBottom: 12,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary[500],
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? colors.white : colors.gray[900],
      marginBottom: 2,
    },
    activityDescription: {
      fontSize: 12,
      color: isDark ? colors.gray[400] : colors.gray[600],
    },
    activityTime: {
      fontSize: 12,
      color: isDark ? colors.gray[500] : colors.gray[500],
    },
  });

  const quickActions = [
    {
      id: "diagnostic",
      title: "Diagnostic Assistant",
      description: "AI-powered diagnostic guidance",
      icon: "cpu",
      onPress: () => navigation.navigate("DiagnosticAssistant"),
    },
    {
      id: "scan",
      title: "Scan Devices",
      description: "Connect to OBD-II devices",
      icon: "bluetooth",
      onPress: () => navigation.navigate("ScanDevices"),
    },
    {
      id: "appointments",
      title: "Appointments",
      description: "View today's schedule",
      icon: "calendar",
      onPress: () => {
        // TODO: Navigate to appointments screen when available
        console.log("Navigate to appointments");
      },
    },
    {
      id: "profile",
      title: "Profile",
      description: "Update your information",
      icon: "user",
      onPress: () => navigation.navigate("Profile"),
    },
  ];

  const recentActivities = [
    {
      id: 1,
      title: "Diagnostic completed",
      description: "Engine misfire analysis for 2018 Toyota Camry",
      time: "2 hours ago",
      icon: "check-circle",
    },
    {
      id: 2,
      title: "Device connected",
      description: "OBDII scanner paired successfully",
      time: "4 hours ago",
      icon: "bluetooth",
    },
    {
      id: 3,
      title: "New appointment",
      description: "Brake inspection scheduled for tomorrow",
      time: "1 day ago",
      icon: "calendar",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>Today's Jobs</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.quickActionIcon}>
                <Feather
                  name={action.icon as any}
                  size={24}
                  color={colors.white}
                />
              </View>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
              <Text style={styles.quickActionDescription}>
                {action.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={styles.recentActivityTitle}>Recent Activity</Text>
        {recentActivities.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Feather
                name={activity.icon as any}
                size={20}
                color={colors.white}
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDescription}>
                {activity.description}
              </Text>
            </View>
            <Text style={styles.activityTime}>{activity.time}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
