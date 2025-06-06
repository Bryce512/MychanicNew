import { useState, useEffect, useRef } from "react";
import {
  NativeModules,
  NativeEventEmitter,
  PermissionsAndroid,
  Platform,
} from "react-native";
import BleManager from "react-native-ble-manager";
import base64 from "react-native-base64";

const { BleManager: BleManagerModule } = NativeModules;
const bleEmitter = new NativeEventEmitter(BleManagerModule);

const SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
const WRITE_UUID = "0000fff2-0000-1000-8000-00805f9b34fb";
const READ_UUID = "0000fff1-0000-1000-8000-00805f9b34fb";

export const useBleConnection = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const responseBuffer = useRef<string>(""); // Temporary data store

  useEffect(() => {
    BleManager.start({ showAlert: false });
  }, []);

  const logMessage = (message: string) => {
    setLog((prev) => [...prev, message]);
    console.log(message);
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  };

  const handleScanAndConnect = async () => {
    await requestPermissions();
    setIsScanning(true);
    logMessage("Starting scan...");

    let found = false;

    const discoverSub = bleEmitter.addListener(
      "BleManagerDiscoverPeripheral",
      async (device) => {
        if (device.name === "OBDII" && !found) {
          found = true;
          BleManager.stopScan();
          discoverSub.remove();

          logMessage(`Found device: ${device.name}`);
          try {
            await BleManager.connect(device.id);
            await BleManager.retrieveServices(device.id);
            setDeviceId(device.id);
            setIsConnected(true);
            logMessage("Connected to OBDII");
            await BleManager.startNotification(
              device.id,
              SERVICE_UUID,
              READ_UUID
            );
          } catch (error: any) {
            logMessage(`Connection failed: ${error.message}`);
          } finally {
            setIsScanning(false);
          }
        }
      }
    );

    BleManager.scan([], 5, true)
      .then(() => logMessage("Scanning for 5 seconds..."))
      .catch((err) => {
        logMessage(`Scan start failed: ${err.message}`);
        setIsScanning(false);
      });

    setTimeout(() => {
      if (!found) {
        discoverSub.remove();
        logMessage("OBDII device not found");
        setIsScanning(false);
      }
    }, 6000);
  };

  const sendCommand = async (command: string): Promise<string> => {
    if (!deviceId) throw new Error("No connected device");

    const encoded = base64.encode(`${command}\r`);
    logMessage(`Sending command: ${command}`);

    responseBuffer.current = "";

    return new Promise((resolve, reject) => {
      const sub = bleEmitter.addListener(
        "BleManagerDidUpdateValueForCharacteristic",
        ({ value }) => {
          if (value) {
            const chunk = base64.decode(value);
            logMessage(`Received chunk: ${chunk}`);
            responseBuffer.current += chunk;

            if (chunk.includes(">")) {
              let full = responseBuffer.current
                .replace(/\r/g, "")
                .replace(/\n/g, "")
                .replace(">", "");

              if (full.startsWith(command)) {
                full = full.replace(command, "").trim();
              }

              logMessage(`Parsed Response: ${full}`);
              sub.remove();
              resolve(full);
            }
          }
        }
      );

      BleManager.write(
        deviceId,
        SERVICE_UUID,
        WRITE_UUID,
        base64ToBytes(encoded)
      ).catch((err) => {
        sub.remove();
        logMessage(`Write error: ${err.message}`);
        reject(err);
      });
    });
  };

  const handleDisconnect = async () => {
    if (!deviceId) {
      logMessage("No device to disconnect");
      return;
    }

    try {
      await BleManager.disconnect(deviceId);
      logMessage("Disconnected");
      setDeviceId(null);
      setIsConnected(false);
    } catch (err: any) {
      logMessage(`Disconnection error: ${err.message}`);
    }
  };

  return {
    isScanning,
    isConnected,
    log,
    logMessage,
    handleScanAndConnect,
    sendCommand,
    handleDisconnect,
  };
};

// Helper: base64 to byte array
const base64ToBytes = (b64: string): number[] => {
  const raw = base64.decode(b64);
  return Array.from(raw).map((c) => c.charCodeAt(0));
};
