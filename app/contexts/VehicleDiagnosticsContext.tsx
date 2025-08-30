import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import firebaseService from "../services/firebaseService";

// Types for diagnostics data
export interface VehicleDiagnostics {
  vehicleId: string;
  dtcCodes: string[];
  milesSinceLastOilChange: number;
  milesBetweenOilChanges: number;
  battV: number;
  battVLastTimestamp: number;
  milesSinceLastBrakeService: number;
  milesBetweenBrakeService: number;
  lastSync: number;
  engineRunning?: boolean;
}

interface DiagnosticsContextType {
  diagnostics: Record<string, VehicleDiagnostics>;
  refreshDiagnostics: () => Promise<void>;
  loading: boolean;
}

const DiagnosticsContext = createContext<DiagnosticsContextType>({
  diagnostics: {},
  refreshDiagnostics: async () => {},
  loading: false,
});

export const DiagnosticsProvider = ({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) => {
  const [diagnostics, setDiagnostics] = useState<
    Record<string, VehicleDiagnostics>
  >({});
  const [loading, setLoading] = useState(false);

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      // Fetch all vehicles for the user
      const vehicles = await firebaseService.getVehicles(userId);
      const diagMap: Record<string, VehicleDiagnostics> = {};
      // For each vehicle, fetch diagInfo from userId/vehicles/vehicleId/diagInfo
      await Promise.all(
        vehicles.map(async (v: any) => {
          try {
            const diagInfo = await firebaseService.getVehicleDiagInfo(
              userId,
              v.id
            );
            diagMap[v.id] = {
              vehicleId: v.id,
              dtcCodes: diagInfo?.dtcCodes || [],
              milesSinceLastOilChange: diagInfo?.milesSinceLastOilChange || 0,
              milesBetweenOilChanges: diagInfo?.milesBetweenOilChanges || 5000,
              battV: diagInfo?.battV || 0,
              battVLastTimestamp: diagInfo?.battVLastTimestamp || Date.now(),
              milesSinceLastBrakeService:
                diagInfo?.milesSinceLastBrakeService || 0,
              milesBetweenBrakeService: diagInfo?.milesBetweenBrakeService || 0,
              lastSync: diagInfo?.lastSync || Date.now(),
              engineRunning: diagInfo?.engineRunning || false,
            };
            console.log("Diagnostics loaded for vehicle:", v.id, diagMap[v.id]);
          } catch (vehicleError) {
            console.error(
              `Failed to fetch diagnostics for vehicle ${v.id}:`,
              vehicleError
            );
            // Still add a default entry for this vehicle
            diagMap[v.id] = {
              vehicleId: v.id,
              dtcCodes: [],
              milesSinceLastOilChange: 0,
              milesBetweenOilChanges: 5000,
              battV: 0,
              battVLastTimestamp: Date.now(),
              milesSinceLastBrakeService: 0,
              milesBetweenBrakeService: 0,
              lastSync: Date.now(),
              engineRunning: false,
            };
          }
        })
      );
      setDiagnostics(diagMap);
    } catch (e) {
      console.error("Failed to fetch diagnostics:", e);
      setDiagnostics({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchDiagnostics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <DiagnosticsContext.Provider
      value={{ diagnostics, refreshDiagnostics: fetchDiagnostics, loading }}
    >
      {children}
    </DiagnosticsContext.Provider>
  );
};

export const useDiagnostics = () => useContext(DiagnosticsContext);

// Wrapper to get userId from AuthContext and provide DiagnosticsProvider
export const DiagnosticsProviderWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();

  // Instead of returning null, return children without the provider
  // This prevents breaking the component tree when user is not authenticated
  if (!user || !user.uid) {
    return <>{children}</>;
  }

  return (
    <DiagnosticsProvider userId={user.uid}>{children}</DiagnosticsProvider>
  );
};
