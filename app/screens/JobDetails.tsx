import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import {
  useNavigation,
  useRoute,
  NavigationProp,
  RouteProp,
} from "@react-navigation/native";
import React from "react";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Feather } from "@expo/vector-icons";
import Card, { CardHeader, CardContent, CardFooter } from "../components/Card";
import { useTheme } from "../components/theme-provider";
import { colors } from "../theme/colors";
import { Job, userProfile, vehicle } from "../../types";
import firebaseService from "../services/firebaseService";
import { useAuth } from "../contexts/AuthContext";

type JobDetailsScreenRouteProp = RouteProp<RootStackParamList, "JobDetails">;

export default function JobDetailsScreen() {
  const { isDark } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<JobDetailsScreenRouteProp>();
  const [job, setJob] = React.useState<Job | null>(null);
  const [car, setCar] = React.useState<vehicle | null>(null);
  const [customerProfile, setCustomerProfile] =
    React.useState<userProfile | null>(null);
  const { jobId } = route.params;
  const userRole = useAuth().profile?.role;

  React.useEffect(() => {
    firebaseService.getJob(jobId).then((fetchedJob) => {
      setJob(fetchedJob?.data as Job);
    });
  }, []); // Empty dependency array - runs only on mount

  // Separate useEffect to fetch profile when job is loaded
  React.useEffect(() => {
    if (job?.ownerId) {
      firebaseService.getUserProfile(job.ownerId).then((profile) => {
        setCustomerProfile(profile);
      });
    }
    if (job?.vehicleId) {
      firebaseService.getVehicleById(job.vehicleId).then((vehicle) => {
        setCar(vehicle);
      });
    }
  }, [job?.ownerId, job?.vehicleId]); // Runs when job.ownerId or job.vehicleId changes

  const handleClaimJob = () => {
    // Logic to claim the job goes here
    alert("Job claimed successfully!");
  };

  const handleReleaseJob = () => {
    firebaseService.releaseJob(jobId);
    alert("Job released successfully!");
  }

  const handleCall = () => {
    Linking.openURL(`tel:${customerProfile?.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${customerProfile?.email}`);
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.gray[900] : colors.gray[50] },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* User Information Card */}
      {userRole === "mechanic" && (
        <Card>
          <CardHeader>
            <Text
              style={[
                styles.cardTitle,
                { color: isDark ? colors.white : colors.gray[900] },
              ]}
            >
              Customer Information
            </Text>
          </CardHeader>
          <CardContent>
            <View style={styles.infoRow}>
              <Feather
                name="user"
                size={20}
                color={isDark ? colors.gray[400] : colors.gray[500]}
              />
              <Text
                style={[
                  styles.infoText,
                  { color: isDark ? colors.white : colors.gray[900] },
                ]}
              >
                {customerProfile?.name}
              </Text>
            </View>

            <TouchableOpacity style={styles.infoRow} onPress={handleEmail}>
              <Feather
                name="mail"
                size={20}
                color={isDark ? colors.gray[400] : colors.gray[500]}
              />
              <Text style={[styles.infoText, { color: colors.primary[500] }]}>
                {customerProfile?.email}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
              <Feather
                name="phone"
                size={20}
                color={isDark ? colors.gray[400] : colors.gray[500]}
              />
              <Text style={[styles.infoText, { color: colors.primary[500] }]}>
                {customerProfile?.phone}
              </Text>
            </TouchableOpacity>

            <View style={styles.infoRow}>
              <Feather
                name="map-pin"
                size={20}
                color={isDark ? colors.gray[400] : colors.gray[500]}
              />
              <Text
                style={[
                  styles.infoText,
                  { color: isDark ? colors.white : colors.gray[900] },
                ]}
              >
                {customerProfile?.location}
              </Text>
            </View>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Information Card */}
      {userRole === "mechanic" && (
        <Card>
          <CardHeader>
            <Text
              style={[
                styles.cardTitle,
                { color: isDark ? colors.white : colors.gray[900] },
              ]}
            >
              Vehicle Information
            </Text>
          </CardHeader>
          <CardContent>
            <View style={styles.vehicleHeader}>
              <Text
                style={[
                  styles.vehicleName,
                  { color: isDark ? colors.white : colors.gray[900] },
                ]}
              >
                {car?.year} {car?.make} {car?.model}
              </Text>
            </View>

            <View style={styles.vehicleDetails}>
              <View style={styles.vehicleDetailItem}>
                <Text
                  style={[
                    styles.vehicleDetailLabel,
                    { color: isDark ? colors.gray[400] : colors.gray[600] },
                  ]}
                >
                  Color:{" "}
                  <Text
                    style={[
                      styles.vehicleDetailValue,
                      { color: isDark ? colors.white : colors.gray[900] },
                    ]}
                  >
                    {car?.color}
                  </Text>
                </Text>
              </View>

              <View style={styles.vehicleDetailItem}>
                <Text
                  style={[
                    styles.vehicleDetailLabel,
                    { color: isDark ? colors.gray[400] : colors.gray[600] },
                  ]}
                >
                  VIN:{" "}
                  <Text
                    style={[
                      styles.vehicleDetailValue,
                      { color: isDark ? colors.white : colors.gray[900] },
                    ]}
                  >
                    {car?.vin}
                  </Text>
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
      )}
      {/* Diagnostic Information Card */}
      <Card>
        <CardHeader>
          <View style={styles.diagnosticHeader}>
            <Text
              style={[
                styles.cardTitle,
                { color: isDark ? colors.white : colors.gray[900] },
              ]}
            >
              Diagnostic Code: {job?.dtcCodes?.join(", ")}
            </Text>
            <View
              style={[
                styles.severityBadge,
                {
                  backgroundColor:
                    job?.priority === "high"
                      ? colors.red[500]
                      : job?.priority === "medium"
                      ? colors.yellow[500]
                      : colors.green[500],
                },
              ]}
            >
              <Text style={styles.severityText}>{job?.priority}</Text>
            </View>
          </View>
        </CardHeader>
        <CardContent>
          <Text
            style={[
              styles.diagnosticTitle,
              { color: isDark ? colors.white : colors.gray[900] },
            ]}
          >
            {job?.title}
          </Text>

          <Text
            style={[
              styles.diagnosticDescription,
              { color: isDark ? colors.gray[300] : colors.gray[700] },
            ]}
          >
            {job?.description}
          </Text>
        </CardContent>
      </Card>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {(userRole === "mechanic" || userRole === "admin") && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: job?.status === "available" ? colors.primary[500] : colors.primary[300] },
            ]}
            onPress= {job?.status === "available" ? handleClaimJob : handleReleaseJob}
          >
            <Text style={styles.actionButtonText}> {job?.status === "available" ? "Claim Job" : "Release Job"}</Text>
          </TouchableOpacity>
        )}
        {(userRole === "user" || userRole === "admin") && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.primary[500] },
            ]}
            onPress={() => navigation.navigate("FindMechanics")}
          >
            <Text style={styles.actionButtonText}>Request Mechanic</Text>
          </TouchableOpacity>
        )}
        {userRole === "user" && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.primary[500] },
            ]}
            onPress={() => navigation.navigate("FindMechanics")}
          >
            <Text style={styles.actionButtonText}>Find Mechanics</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
  },
  vehicleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: "600",
  },
  vehicleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  vehicleBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  vehicleDetails: {
    marginBottom: 8,
  },
  vehicleDetailItem: {
    marginBottom: 8,
  },
  vehicleDetailLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  vehicleDetailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  diagnosticHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  diagnosticTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  diagnosticDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  diagnosticMeta: {
    marginTop: 8,
  },
  diagnosticMetaText: {
    fontSize: 14,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
