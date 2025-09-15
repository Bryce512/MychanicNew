import BleManager from "react-native-ble-manager";
import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid,
} from "react-native";
import Base64 from "react-native-base64";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const SERVICE_UUID = "00001101-0000-1000-8000-00805F9B34FB";
const CHARACTERISTIC_UUID = "0000FFF1-0000-1000-8000-00805F9B34FB";

class BluetoothManager {
  private deviceId: string | null = null;
  private isInitialized: boolean = false;

  constructor() {
    // Initialize in the constructor but handle errors gracefully
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await BleManager.start({ showAlert: false });
      this.isInitialized = true;
      console.log("BleManager initialized successfully");
    } catch (error) {
      console.error("Failed to initialize BleManager:", error);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  async requestPermissions(): Promise<void> {
    if (Platform.OS === "android" && Platform.Version >= 23) {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  }

  async startScan(): Promise<string> {
    await this.ensureInitialized();
    await this.requestPermissions();

    return new Promise((resolve, reject) => {
      let found = false;
      const timeoutId = setTimeout(() => {
        if (!found) {
          BleManager.stopScan()
            .then(() => subscription.remove())
            .catch(() => subscription.remove());
          reject(new Error("OBDII device not found"));
        }
      }, 6000);

      const subscription = bleManagerEmitter.addListener(
        "BleManagerDiscoverPeripheral",
        (device) => {
          console.log(
            "Discovered device:",
            device.name || "(no name)",
            device.id
          );

          if (device.name === "OBDII") {
            found = true;
            this.deviceId = device.id;
            clearTimeout(timeoutId);

            BleManager.stopScan()
              .then(() => {
                subscription.remove();
                resolve(device.id);
              })
              .catch((error) => {
                subscription.remove();
                reject(error);
              });
          }
        }
      );

      // Use the built-in promise method for scanning
      BleManager.scan([], 5, true)
        .then(() => {
          console.log("Scanning for devices...");
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          subscription.remove();
          reject(error);
        });
    });
  }

  async connectToDevice(): Promise<void> {
    if (!this.deviceId) throw new Error("No device selected");

    await this.ensureInitialized();

    try {
      // Disconnect first if already connected (cleanup)
      await BleManager.disconnect(this.deviceId).catch(() => {
        // Ignore disconnect errors if not connected
      });

      // Use the built-in promise method for connection
      await BleManager.connect(this.deviceId);
      console.log(`Connected to device ${this.deviceId}`);

      // Retrieve services using built-in promise method
      await BleManager.retrieveServices(this.deviceId);
      console.log("Services retrieved");
    } catch (error) {
      console.error("Connection failed:", error);
      throw error;
    }
  }

  async disconnectFromDevice(): Promise<void> {
    if (!this.deviceId) throw new Error("No connected device");

    try {
      await BleManager.disconnect(this.deviceId);
      console.log("Disconnected from device");
      this.deviceId = null;
    } catch (error) {
      console.error("Disconnect failed:", error);
      // Still reset deviceId even if disconnect fails
      this.deviceId = null;
      throw error;
    }
  }

  async stopScan(): Promise<void> {
    try {
      await BleManager.stopScan();
      console.log("Scan stopped successfully");
    } catch (error) {
      console.error("Error stopping scan:", error);
      throw error;
    }
  }

  async writeCommand(hexCommand: string): Promise<void> {
    if (!this.deviceId) throw new Error("No connected device");

    await this.ensureInitialized();

    try {
      const base64 = hexToBase64(hexCommand);
      const bytes = base64ToBytes(base64);

      await BleManager.write(
        this.deviceId,
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        bytes
      );
      console.log("Command sent successfully");
    } catch (error) {
      console.error("Write command failed:", error);
      throw error;
    }
  }

  async readResponse(): Promise<string> {
    if (!this.deviceId) throw new Error("No connected device");

    await this.ensureInitialized();

    try {
      const data = await BleManager.read(
        this.deviceId,
        SERVICE_UUID,
        CHARACTERISTIC_UUID
      );
      const hex = bytesToHex(data);
      console.log("Received data:", hex);
      return hex;
    } catch (error) {
      console.error("Read response failed:", error);
      throw error;
    }
  }

  async connectToRememberedDevice(): Promise<boolean> {
    if (!this.deviceId) {
      console.log("ℹ️ No remembered device found");
      return false;
    }

    await this.ensureInitialized();

    try {
      await this.connectToDevice();
      console.log(
        `✅ Successfully connected to remembered device ${this.deviceId}`
      );
      return true;
    } catch (error) {
      console.log(
        `❌ Error connecting to remembered device: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      // Reset device state on failure
      this.deviceId = null;
      // Add a delay to avoid rapid reconnect loops
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return false;
    }
  }

  // Additional utility methods
  async isDeviceConnected(): Promise<boolean> {
    if (!this.deviceId) return false;

    try {
      const connectedDevices = await BleManager.getConnectedPeripherals([]);
      return connectedDevices.some((device) => device.id === this.deviceId);
    } catch (error) {
      console.error("Error checking connection status:", error);
      return false;
    }
  }

  async checkBluetoothState(): Promise<string> {
    try {
      const state = await BleManager.checkState();
      console.log("Bluetooth state:", state);
      return state;
    } catch (error) {
      console.error("Error checking Bluetooth state:", error);
      throw error;
    }
  }

  getDeviceId(): string | null {
    return this.deviceId;
  }

  setDeviceId(deviceId: string): void {
    this.deviceId = deviceId;
  }
}

// Helper functions
function hexToBase64(hex: string): string {
  let raw = "";
  for (let i = 0; i < hex.length; i += 2) {
    raw += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return Base64.encode(raw);
}

function base64ToBytes(base64: string): number[] {
  const raw = Base64.decode(base64);
  return Array.from(raw).map((char) => char.charCodeAt(0));
}

function bytesToHex(bytes: number[]): string {
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default BluetoothManager;
