import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useBleConnection } from "../services/bleConnections";
import { AppState } from "react-native";
import Device from "react-native-ble-manager";

// Define the shape of our context
interface BluetoothContextType {
  isScanning: boolean;
  isConnected: boolean;
  deviceId: string | null;
  deviceName: string | null;
  discoveredDevices: any[];
  voltage: string | null; // Assuming voltage is a number, adjust type as needed
  setDiscoveredDevices: (devices: any[]) => void;
  showDeviceSelector: boolean;
  setShowDeviceSelector: (show: boolean) => void;
  startScan: () => Promise<void>;
  connectToDevice: (device: any) => Promise<boolean>;
  disconnectDevice: () => Promise<void>;
  sendCommand: (device: any, command: string) => Promise<string>;
  showAllDevices: () => Promise<void>;
  rememberedDevice: any | null;
  verifyConnection: (deviceId: string) => Promise<boolean>;
  connectToRememberedDevice: () => Promise<boolean>;
  logMessage: (message: string) => void;
  robustReconnect: () => Promise<boolean>;
  reconnectAttempt: number;
  enhancedVerifyConnection: (deviceId: string) => Promise<boolean>;
  fetchVoltage: () => Promise<void>;
  connectToBondedDeviceIfAvailable: () => Promise<string | null>;
}

// Create the context
const BluetoothContext = createContext<BluetoothContextType | undefined>(
  undefined
);

// Provider component
export const BluetoothProvider = ({ children }: { children: ReactNode }) => {
  // Get base BLE functionality from the hook
  const bleConnectionHook = useBleConnection();

  const [voltage, setVoltage] = useState<string | null>(null);

  // Maintain context-level state that persists across screens
  const [isConnected, setIsConnected] = useState(bleConnectionHook.isConnected);
  const [isScanning, setIsScanning] = useState(bleConnectionHook.isScanning);
  const [deviceId, setDeviceId] = useState<string | null>(
    bleConnectionHook.deviceId
  );
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [discoveredDevices, setDiscoveredDevices] = useState<any[]>(
    bleConnectionHook.discoveredDevices
  );
  const [showDeviceSelector, setShowDeviceSelector] = useState(
    bleConnectionHook.showDeviceSelector
  );

  const connectToBondedDeviceIfAvailable =
    bleConnectionHook.connectToBondedDeviceIfAvailable;

  const [rememberedDevice, setRememberedDevice] = useState(
    bleConnectionHook.rememberedDevice
  );
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const logMessage = bleConnectionHook.logMessage;
  const showAllDevices = bleConnectionHook.showAllDevices;
  const sendCommand = bleConnectionHook.sendCommand;

  // Reference to hook's log to track changes

  // Sync hook state to context state
  useEffect(() => {
    setIsConnected(bleConnectionHook.isConnected);
    setDeviceId(bleConnectionHook.deviceId);
    setDiscoveredDevices(bleConnectionHook.discoveredDevices);
    setShowDeviceSelector(bleConnectionHook.showDeviceSelector);
    setRememberedDevice(bleConnectionHook.rememberedDevice);
    setVoltage(bleConnectionHook.voltage); // Add this line
  }, [
    bleConnectionHook.isConnected,
    bleConnectionHook.deviceId,
    bleConnectionHook.discoveredDevices,
    bleConnectionHook.showDeviceSelector,
    bleConnectionHook.rememberedDevice,
    bleConnectionHook.voltage
  ]);

  useEffect(() => {
    // Try to reconnect automatically on app start
    (async () => {
      const connectedDevice = await connectToBondedDeviceIfAvailable();
      if (connectedDevice) {
        setDeviceId(connectedDevice.id);
        setIsConnected(true);
      }
    })();
  }, []);


  // Monitor app state for background/foreground transitions
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        verifyAndReconnectIfNeeded();
      }
    });

    return () => subscription.remove();
  }, [deviceId, isConnected]);

  // Verify connection periodically
  useEffect(() => {
    if (isConnected && deviceId) {
      const interval = setInterval(async () => {
        const stillConnected = await verifyConnection(deviceId);
        if (!stillConnected && rememberedDevice) {
          logMessage("Connection lost, attempting reconnection from context");
          connectToRememberedDevice();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isConnected, deviceId, rememberedDevice]);

  // Enhanced version of verifyConnection that updates context state
  const verifyConnection = async (deviceId: string): Promise<boolean> => {
    try {
      const isStillConnected =
        await bleConnectionHook.verifyConnection(deviceId);
      setIsConnected(isStillConnected);
      return isStillConnected;
    } catch (error) {
      setIsConnected(false);
      return false;
    }
  };

  // Verify and reconnect if needed
  const verifyAndReconnectIfNeeded = async () => {
    if (isConnected && deviceId) {
      logMessage("Verifying connection after app state change...");
      const stillConnected = await verifyConnection(deviceId);

      if (!stillConnected && rememberedDevice) {
        logMessage("Connection lost, attempting reconnection from context");
        try {
          await connectToRememberedDevice();
        } catch (error) {
          console.error("Reconnection failed:", error);
        }
      }
    }
  };

  // Enhanced connect function that updates context state
  const connectToDevice = async (device: any): Promise<boolean> => {
    try {
      logMessage(`Connecting to ${device.name || "Unnamed Device"}...`);
      const success = await bleConnectionHook.connectToDevice(device);

      if (success) {
        setIsConnected(true);
        setDeviceId(device.id);
        setDeviceName(device.name);
        setRememberedDevice(device);
      }

      return success;
    } catch (error) {
      logMessage(
        `Connection error: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  };

  // Enhanced reconnect function that updates context state
  const connectToRememberedDevice = async (): Promise<boolean> => {
    try {
      setReconnectAttempt((prev) => prev + 1);
      const success = await bleConnectionHook.connectToRememberedDevice();

      if (success && rememberedDevice) {
        setIsConnected(true);
        setDeviceId(rememberedDevice.id);
        setDeviceName(rememberedDevice.name);
      }

      return success;
    } catch (error) {
      logMessage(
        `Reconnection error: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  };

  // Enhanced disconnect function
  const disconnectDevice = async (): Promise<void> => {
    try {
      await bleConnectionHook.disconnectDevice();
      setIsConnected(false);
      setDeviceId(null);
    } catch (error) {
      logMessage(
        `Disconnect error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // Enhanced scan function
  const startScan = async (): Promise<void> => {
    try {
      await bleConnectionHook.startScan();
    } catch (error) {
      logMessage(
        `Scan error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // Enhanced reconnect function with robustness
  const robustReconnect = async (): Promise<boolean> => {
    try {
      setReconnectAttempt((prev) => prev + 1);

      // First try normal reconnect
      let success = await connectToRememberedDevice();

      // If failed, try additional methods
      if (!success && rememberedDevice) {
        // Try with enhanced verification
        logMessage(
          "First attempt failed, trying with enhanced verification..."
        );
        const enhancedVerified = await enhancedVerifyConnection(
          rememberedDevice.id
        );

        if (enhancedVerified) {
          setIsConnected(true);
          setDeviceId(rememberedDevice.id);
          return true;
        }
      }

      return success;
    } catch (error) {
      logMessage(
        `Robust reconnect error: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  };

  // Enhanced verification with additional checks
  const enhancedVerifyConnection = async (
    deviceId: string
  ): Promise<boolean> => {
    try {
      // First try standard verification
      const basicVerified = await verifyConnection(deviceId);
      if (basicVerified) return true;

      // Additional verification logic can be added here
      // For example, trying to read a characteristic
      logMessage("Running enhanced verification steps...");

      return false; // Default to false until implemented
    } catch (error) {
      return false;
    }
  };

  // Create the complete context value by combining hook functions with enhanced ones
  // Provide fetchVoltage from bleConnectionHook or define it here
  const fetchVoltage = bleConnectionHook.fetchVoltage;

  const contextValue = {
    // Context-managed state
    voltage,
    isScanning,
    isConnected,
    deviceId,
    deviceName,
    discoveredDevices,
    showDeviceSelector,
    rememberedDevice,
    reconnectAttempt,

    // Enhanced functions with context state management
    setDiscoveredDevices,
    sendCommand,
    setShowDeviceSelector,
    showAllDevices,
    startScan,
    connectToDevice,
    disconnectDevice: disconnectDevice,
    connectToRememberedDevice,
    connectToBondedDeviceIfAvailable,
    verifyConnection,
    logMessage,
    robustReconnect,
    enhancedVerifyConnection,
    // Pass through other hook functions
    fetchVoltage,

  };

  return (
    <BluetoothContext.Provider value={contextValue as BluetoothContextType}>
      {children}
    </BluetoothContext.Provider>
  );
};

// Custom hook to use the Bluetooth context
export const useBluetooth = () => {
  const context = useContext(BluetoothContext);
  if (context === undefined) {
    throw new Error("useBluetooth must be used within a BluetoothProvider");
  }
  return context;
};
