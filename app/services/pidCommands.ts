import { useBleConnection } from "./bleConnections";
import { Device } from "react-native-ble-plx";

export const pidCommands = () => {
  const { sendCommand } = useBleConnection();
  // Function to get the current voltage of the OBD-II device

  const getCurrentVoltage = async (device: Device) => {
    try {
      console.log("Fetching voltage...");
      const voltageResponse = await sendCommand(device, "AT RV");
      console.log("Voltage Response:", voltageResponse);
      return String(voltageResponse);
    } catch (error) {
      console.error("Error getting voltage:", error);
      return null;
    }
  };

  const getEngineRPM = async (device: Device) => {
    try {
      console.log("Fetching engine RPM...");
      const rpmResponse = await sendCommand(device, "010C");
      console.log("Engine RPM Response:", rpmResponse);

      // Normalize response to string and split into lines
      const responseStr = String(rpmResponse).replace(/\r/g, "\n");
      const lines = responseStr
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      // Find the last line that looks like a valid hex response (e.g., starts with 41 0C)
      const hexLine = lines.reverse().find((line) => /41\s*0C/i.test(line));
      if (!hexLine) return 0;
      // Remove any non-hex characters (like OK, dots, etc.)
      const hexMatch = hexLine.match(
        /41\s*0C\s*([0-9A-Fa-f]{2})\s*([0-9A-Fa-f]{2})/
      );
      if (!hexMatch) return 0;
      const A = parseInt(hexMatch[1], 16);
      const B = parseInt(hexMatch[2], 16);
      if (isNaN(A) || isNaN(B)) return 0;
      const rpm = (A * 256 + B) / 4;
      return rpm;
    } catch (error) {
      console.error("Error getting engine RPM:", error);
      return 0;
    }
  };

  // You can define more PID functions here, for example:
  const getVehicleSpeed = async (device: Device) => {
    try {
      const rpmResponse = await sendCommand(device, "010D"); // Vehicle Speed command
      console.log("Vehicle Speed Response:", rpmResponse);

      const speed = rpmResponse[3]; // Assuming the response has the speed at byte 3
      console.log("Parsed Vehicle Speed:", speed);
      return speed;
    } catch (error) {
      console.error("Failed to get Vehicle Speed:", error);
    }
  };

  return {
    getCurrentVoltage,
    getEngineRPM,
    getVehicleSpeed,
  };
};
