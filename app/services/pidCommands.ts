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

      // Check if response contains "NO DATA"
      const responseStr = String(voltageResponse);
      if (responseStr.includes("NO DATA")) {
        console.log("Voltage command returned NO DATA");
        return null;
      }

      // Look for voltage pattern (number followed by V)
      const voltageMatch = responseStr.match(/(\d+\.?\d*)\s*V/i);
      if (voltageMatch) {
        return voltageMatch[1] + "V";
      }

      // If no voltage pattern found, return null
      console.log("No valid voltage pattern found in response");
      return null;
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

  // Get coolant temperature (PID 05)
  const getCoolantTemperature = async (device: Device) => {
    try {
      console.log("Fetching coolant temperature...");
      const response = await sendCommand(device, "0105");
      console.log("Coolant Temperature Response:", response);

      const responseStr = String(response).replace(/\r/g, "\n");
      const lines = responseStr
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const hexLine = lines.reverse().find((line) => /41\s*05/i.test(line));
      if (!hexLine) return null;

      const hexMatch = hexLine.match(/41\s*05\s*([0-9A-Fa-f]{2})/);
      if (!hexMatch) return null;

      const A = parseInt(hexMatch[1], 16);
      if (isNaN(A)) return null;

      const tempCelsius = A - 40;
      const tempFahrenheit = (tempCelsius * 9) / 5 + 32;

      return { celsius: tempCelsius, fahrenheit: tempFahrenheit };
    } catch (error) {
      console.error("Error getting coolant temperature:", error);
      return null;
    }
  };

  // Get intake air temperature (PID 0F)
  const getIntakeAirTemperature = async (device: Device) => {
    try {
      console.log("Fetching intake air temperature...");
      const response = await sendCommand(device, "010F");
      console.log("Intake Air Temperature Response:", response);

      const responseStr = String(response).replace(/\r/g, "\n");
      const lines = responseStr
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const hexLine = lines.reverse().find((line) => /41\s*0F/i.test(line));
      if (!hexLine) return null;

      const hexMatch = hexLine.match(/41\s*0F\s*([0-9A-Fa-f]{2})/);
      if (!hexMatch) return null;

      const A = parseInt(hexMatch[1], 16);
      if (isNaN(A)) return null;

      const tempCelsius = A - 40;
      const tempFahrenheit = (tempCelsius * 9) / 5 + 32;

      return { celsius: tempCelsius, fahrenheit: tempFahrenheit };
    } catch (error) {
      console.error("Error getting intake air temperature:", error);
      return null;
    }
  };

  // Get throttle position (PID 11)
  const getThrottlePosition = async (device: Device) => {
    try {
      console.log("Fetching throttle position...");
      const response = await sendCommand(device, "0111");
      console.log("Throttle Position Response:", response);

      const responseStr = String(response).replace(/\r/g, "\n");
      const lines = responseStr
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const hexLine = lines.reverse().find((line) => /41\s*11/i.test(line));
      if (!hexLine) return null;

      const hexMatch = hexLine.match(/41\s*11\s*([0-9A-Fa-f]{2})/);
      if (!hexMatch) return null;

      const A = parseInt(hexMatch[1], 16);
      if (isNaN(A)) return null;

      const throttlePercent = (A * 100) / 255;

      return Math.round(throttlePercent * 10) / 10; // Round to 1 decimal place
    } catch (error) {
      console.error("Error getting throttle position:", error);
      return null;
    }
  };

  // Get fuel level (PID 2F)
  const getFuelLevel = async (device: Device) => {
    try {
      console.log("Fetching fuel level...");
      const response = await sendCommand(device, "012F");
      console.log("Fuel Level Response:", response);

      const responseStr = String(response).replace(/\r/g, "\n");
      const lines = responseStr
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const hexLine = lines.reverse().find((line) => /41\s*2F/i.test(line));
      if (!hexLine) return null;

      const hexMatch = hexLine.match(/41\s*2F\s*([0-9A-Fa-f]{2})/);
      if (!hexMatch) return null;

      const A = parseInt(hexMatch[1], 16);
      if (isNaN(A)) return null;

      const fuelPercent = (A * 100) / 255;

      return Math.round(fuelPercent * 10) / 10; // Round to 1 decimal place
    } catch (error) {
      console.error("Error getting fuel level:", error);
      return null;
    }
  };

  // Get engine load (PID 04)
  const getEngineLoad = async (device: Device) => {
    try {
      console.log("Fetching engine load...");
      const response = await sendCommand(device, "0104");
      console.log("Engine Load Response:", response);

      const responseStr = String(response).replace(/\r/g, "\n");
      const lines = responseStr
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const hexLine = lines.reverse().find((line) => /41\s*04/i.test(line));
      if (!hexLine) return null;

      const hexMatch = hexLine.match(/41\s*04\s*([0-9A-Fa-f]{2})/);
      if (!hexMatch) return null;

      const A = parseInt(hexMatch[1], 16);
      if (isNaN(A)) return null;

      const loadPercent = (A * 100) / 255;

      return Math.round(loadPercent * 10) / 10; // Round to 1 decimal place
    } catch (error) {
      console.error("Error getting engine load:", error);
      return null;
    }
  };

  // Get manifold absolute pressure (PID 0B)
  const getManifoldPressure = async (device: Device) => {
    try {
      console.log("Fetching manifold pressure...");
      const response = await sendCommand(device, "010B");
      console.log("Manifold Pressure Response:", response);

      const responseStr = String(response).replace(/\r/g, "\n");
      const lines = responseStr
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const hexLine = lines.reverse().find((line) => /41\s*0B/i.test(line));
      if (!hexLine) return null;

      const hexMatch = hexLine.match(/41\s*0B\s*([0-9A-Fa-f]{2})/);
      if (!hexMatch) return null;

      const A = parseInt(hexMatch[1], 16);
      if (isNaN(A)) return null;

      return A; // kPa
    } catch (error) {
      console.error("Error getting manifold pressure:", error);
      return null;
    }
  };

  // You can define more PID functions here, for example:
  const getVehicleSpeed = async (device: Device) => {
    try {
      console.log("Fetching vehicle speed...");
      const response = await sendCommand(device, "010D"); // Vehicle Speed command
      console.log("Vehicle Speed Response:", response);

      const responseStr = String(response).replace(/\r/g, "\n");
      const lines = responseStr
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const hexLine = lines.reverse().find((line) => /41\s*0D/i.test(line));
      if (!hexLine) return null;

      const hexMatch = hexLine.match(/41\s*0D\s*([0-9A-Fa-f]{2})/);
      if (!hexMatch) return null;

      const A = parseInt(hexMatch[1], 16);
      if (isNaN(A)) return null;

      return A; // km/h
    } catch (error) {
      console.error("Failed to get Vehicle Speed:", error);
      return null;
    }
  };

  return {
    getCurrentVoltage,
    getEngineRPM,
    getVehicleSpeed,
    getCoolantTemperature,
    getIntakeAirTemperature,
    getThrottlePosition,
    getFuelLevel,
    getEngineLoad,
    getManifoldPressure,
  };
};
