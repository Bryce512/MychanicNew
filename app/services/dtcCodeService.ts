/**
 * DTC Codes Database
 * Comprehensive list of Diagnostic Trouble Codes with descriptions
 */

export interface DTCCode {
  code: string;
  description: string;
  category: "Powertrain" | "Body" | "Chassis" | "Network";
  severity: "Low" | "Medium" | "High" | "Critical";
  system: string;
}

// Comprehensive DTC codes database
export const DTC_CODES: DTCCode[] = [
  // Powertrain Codes (P0xxx and P1xxx)
  {
    code: "P0001",
    description: "Fuel Volume Regulator Control Circuit/Open",
    category: "Powertrain",
    severity: "Medium",
    system: "Fuel System",
  },
  {
    code: "P0002",
    description: "Fuel Volume Regulator Control Circuit Range/Performance",
    category: "Powertrain",
    severity: "Medium",
    system: "Fuel System",
  },
  {
    code: "P0003",
    description: "Fuel Volume Regulator Control Circuit Low",
    category: "Powertrain",
    severity: "Medium",
    system: "Fuel System",
  },
  {
    code: "P0004",
    description: "Fuel Volume Regulator Control Circuit High",
    category: "Powertrain",
    severity: "Medium",
    system: "Fuel System",
  },
  {
    code: "P0005",
    description: "Fuel Shutoff Valve A Control Circuit/Open",
    category: "Powertrain",
    severity: "High",
    system: "Fuel System",
  },

  // Common Engine Codes
  {
    code: "P0100",
    description: "Mass or Volume Air Flow Circuit Malfunction",
    category: "Powertrain",
    severity: "Medium",
    system: "Air Intake",
  },
  {
    code: "P0101",
    description: "Mass or Volume Air Flow Circuit Range/Performance Problem",
    category: "Powertrain",
    severity: "Medium",
    system: "Air Intake",
  },
  {
    code: "P0102",
    description: "Mass or Volume Air Flow Circuit Low Input",
    category: "Powertrain",
    severity: "Medium",
    system: "Air Intake",
  },
  {
    code: "P0103",
    description: "Mass or Volume Air Flow Circuit High Input",
    category: "Powertrain",
    severity: "Medium",
    system: "Air Intake",
  },
  {
    code: "P0104",
    description: "Mass or Volume Air Flow Circuit Intermittent",
    category: "Powertrain",
    severity: "Medium",
    system: "Air Intake",
  },

  {
    code: "P0110",
    description: "Intake Air Temperature Circuit Malfunction",
    category: "Powertrain",
    severity: "Low",
    system: "Air Intake",
  },
  {
    code: "P0111",
    description: "Intake Air Temperature Circuit Range/Performance Problem",
    category: "Powertrain",
    severity: "Low",
    system: "Air Intake",
  },
  {
    code: "P0112",
    description: "Intake Air Temperature Circuit Low Input",
    category: "Powertrain",
    severity: "Low",
    system: "Air Intake",
  },
  {
    code: "P0113",
    description: "Intake Air Temperature Circuit High Input",
    category: "Powertrain",
    severity: "Low",
    system: "Air Intake",
  },

  {
    code: "P0120",
    description: "Throttle/Pedal Position Sensor/Switch A Circuit Malfunction",
    category: "Powertrain",
    severity: "High",
    system: "Throttle",
  },
  {
    code: "P0121",
    description:
      "Throttle/Pedal Position Sensor/Switch A Circuit Range/Performance Problem",
    category: "Powertrain",
    severity: "High",
    system: "Throttle",
  },
  {
    code: "P0122",
    description: "Throttle/Pedal Position Sensor/Switch A Circuit Low Input",
    category: "Powertrain",
    severity: "High",
    system: "Throttle",
  },
  {
    code: "P0123",
    description: "Throttle/Pedal Position Sensor/Switch A Circuit High Input",
    category: "Powertrain",
    severity: "High",
    system: "Throttle",
  },

  {
    code: "P0128",
    description:
      "Coolant Thermostat (Coolant Temperature Below Thermostat Regulating Temperature)",
    category: "Powertrain",
    severity: "Medium",
    system: "Cooling",
  },
  {
    code: "P0130",
    description: "O2 Sensor Circuit Malfunction (Bank 1 Sensor 1)",
    category: "Powertrain",
    severity: "Medium",
    system: "Emissions",
  },
  {
    code: "P0131",
    description: "O2 Sensor Circuit Low Voltage (Bank 1 Sensor 1)",
    category: "Powertrain",
    severity: "Medium",
    system: "Emissions",
  },
  {
    code: "P0132",
    description: "O2 Sensor Circuit High Voltage (Bank 1 Sensor 1)",
    category: "Powertrain",
    severity: "Medium",
    system: "Emissions",
  },
  {
    code: "P0133",
    description: "O2 Sensor Circuit Slow Response (Bank 1 Sensor 1)",
    category: "Powertrain",
    severity: "Medium",
    system: "Emissions",
  },
  {
    code: "P0134",
    description: "O2 Sensor Circuit No Activity Detected (Bank 1 Sensor 1)",
    category: "Powertrain",
    severity: "Medium",
    system: "Emissions",
  },

  {
    code: "P0171",
    description: "System Too Lean (Bank 1)",
    category: "Powertrain",
    severity: "Medium",
    system: "Fuel System",
  },
  {
    code: "P0172",
    description: "System Too Rich (Bank 1)",
    category: "Powertrain",
    severity: "Medium",
    system: "Fuel System",
  },
  {
    code: "P0174",
    description: "System Too Lean (Bank 2)",
    category: "Powertrain",
    severity: "Medium",
    system: "Fuel System",
  },
  {
    code: "P0175",
    description: "System Too Rich (Bank 2)",
    category: "Powertrain",
    severity: "Medium",
    system: "Fuel System",
  },

  // Misfire Codes
  {
    code: "P0300",
    description: "Random/Multiple Cylinder Misfire Detected",
    category: "Powertrain",
    severity: "High",
    system: "Ignition",
  },
  {
    code: "P0301",
    description: "Cylinder 1 Misfire Detected",
    category: "Powertrain",
    severity: "High",
    system: "Ignition",
  },
  {
    code: "P0302",
    description: "Cylinder 2 Misfire Detected",
    category: "Powertrain",
    severity: "High",
    system: "Ignition",
  },
  {
    code: "P0303",
    description: "Cylinder 3 Misfire Detected",
    category: "Powertrain",
    severity: "High",
    system: "Ignition",
  },
  {
    code: "P0304",
    description: "Cylinder 4 Misfire Detected",
    category: "Powertrain",
    severity: "High",
    system: "Ignition",
  },
  {
    code: "P0305",
    description: "Cylinder 5 Misfire Detected",
    category: "Powertrain",
    severity: "High",
    system: "Ignition",
  },
  {
    code: "P0306",
    description: "Cylinder 6 Misfire Detected",
    category: "Powertrain",
    severity: "High",
    system: "Ignition",
  },
  {
    code: "P0307",
    description: "Cylinder 7 Misfire Detected",
    category: "Powertrain",
    severity: "High",
    system: "Ignition",
  },
  {
    code: "P0308",
    description: "Cylinder 8 Misfire Detected",
    category: "Powertrain",
    severity: "High",
    system: "Ignition",
  },

  // Catalyst Codes
  {
    code: "P0420",
    description: "Catalyst System Efficiency Below Threshold (Bank 1)",
    category: "Powertrain",
    severity: "Medium",
    system: "Emissions",
  },
  {
    code: "P0421",
    description: "Warm Up Catalyst Efficiency Below Threshold (Bank 1)",
    category: "Powertrain",
    severity: "Medium",
    system: "Emissions",
  },
  {
    code: "P0430",
    description: "Catalyst System Efficiency Below Threshold (Bank 2)",
    category: "Powertrain",
    severity: "Medium",
    system: "Emissions",
  },
  {
    code: "P0431",
    description: "Warm Up Catalyst Efficiency Below Threshold (Bank 2)",
    category: "Powertrain",
    severity: "Medium",
    system: "Emissions",
  },

  // EVAP Codes
  {
    code: "P0440",
    description: "Evaporative Emission Control System Malfunction",
    category: "Powertrain",
    severity: "Low",
    system: "Emissions",
  },
  {
    code: "P0441",
    description: "Evaporative Emission Control System Incorrect Purge Flow",
    category: "Powertrain",
    severity: "Low",
    system: "Emissions",
  },
  {
    code: "P0442",
    description:
      "Evaporative Emission Control System Leak Detected (Small Leak)",
    category: "Powertrain",
    severity: "Low",
    system: "Emissions",
  },
  {
    code: "P0443",
    description:
      "Evaporative Emission Control System Purge Control Valve Circuit Malfunction",
    category: "Powertrain",
    severity: "Low",
    system: "Emissions",
  },
  {
    code: "P0446",
    description:
      "Evaporative Emission Control System Vent Control Circuit Malfunction",
    category: "Powertrain",
    severity: "Low",
    system: "Emissions",
  },
  {
    code: "P0455",
    description:
      "Evaporative Emission Control System Leak Detected (Gross Leak)",
    category: "Powertrain",
    severity: "Medium",
    system: "Emissions",
  },

  // Transmission Codes
  {
    code: "P0700",
    description: "Transmission Control System Malfunction",
    category: "Powertrain",
    severity: "High",
    system: "Transmission",
  },
  {
    code: "P0701",
    description: "Transmission Control System Range/Performance",
    category: "Powertrain",
    severity: "High",
    system: "Transmission",
  },
  {
    code: "P0702",
    description: "Transmission Control System Electrical",
    category: "Powertrain",
    severity: "High",
    system: "Transmission",
  },
  {
    code: "P0703",
    description: "Torque Converter/Brake Switch B Circuit Malfunction",
    category: "Powertrain",
    severity: "High",
    system: "Transmission",
  },
  {
    code: "P0705",
    description: "Transmission Range Sensor Circuit Malfunction (PRNDL Input)",
    category: "Powertrain",
    severity: "High",
    system: "Transmission",
  },

  // Body Codes (B0xxx)
  {
    code: "B0001",
    description: "Driver Frontal Stage 1 Deployment Loop Resistance High",
    category: "Body",
    severity: "High",
    system: "Airbag",
  },
  {
    code: "B0002",
    description: "Driver Frontal Stage 1 Deployment Loop Resistance Low",
    category: "Body",
    severity: "High",
    system: "Airbag",
  },
  {
    code: "B0003",
    description: "Driver Frontal Stage 2 Deployment Loop Resistance High",
    category: "Body",
    severity: "High",
    system: "Airbag",
  },
  {
    code: "B0004",
    description: "Driver Frontal Stage 2 Deployment Loop Resistance Low",
    category: "Body",
    severity: "High",
    system: "Airbag",
  },

  // Chassis Codes (C0xxx)
  {
    code: "C0035",
    description: "Left Front Wheel Speed Sensor Circuit",
    category: "Chassis",
    severity: "High",
    system: "ABS",
  },
  {
    code: "C0040",
    description: "Right Front Wheel Speed Sensor Circuit",
    category: "Chassis",
    severity: "High",
    system: "ABS",
  },
  {
    code: "C0045",
    description: "Left Rear Wheel Speed Sensor Circuit",
    category: "Chassis",
    severity: "High",
    system: "ABS",
  },
  {
    code: "C0050",
    description: "Right Rear Wheel Speed Sensor Circuit",
    category: "Chassis",
    severity: "High",
    system: "ABS",
  },
  {
    code: "C0121",
    description: "Valve Relay Circuit",
    category: "Chassis",
    severity: "High",
    system: "ABS",
  },
  {
    code: "C0141",
    description: "System Voltage Low",
    category: "Chassis",
    severity: "Medium",
    system: "ABS",
  },
  {
    code: "C0161",
    description: "ABS/TCS Brake Switch Circuit",
    category: "Chassis",
    severity: "High",
    system: "ABS",
  },

  // Network Codes (U0xxx)
  {
    code: "U0001",
    description: "CAN Communication Bus",
    category: "Network",
    severity: "Medium",
    system: "Communication",
  },
  {
    code: "U0100",
    description: "Lost Communication With ECM/PCM A",
    category: "Network",
    severity: "High",
    system: "Communication",
  },
  {
    code: "U0101",
    description: "Lost Communication With TCM",
    category: "Network",
    severity: "High",
    system: "Communication",
  },
  {
    code: "U0102",
    description: "Lost Communication With Transfer Case Control Module",
    category: "Network",
    severity: "Medium",
    system: "Communication",
  },
  {
    code: "U0103",
    description: "Lost Communication With Gear Shift Module",
    category: "Network",
    severity: "Medium",
    system: "Communication",
  },
  {
    code: "U0121",
    description:
      "Lost Communication With Anti-Lock Brake System (ABS) Control Module",
    category: "Network",
    severity: "High",
    system: "Communication",
  },
  {
    code: "U0140",
    description: "Lost Communication With Body Control Module",
    category: "Network",
    severity: "Medium",
    system: "Communication",
  },
  {
    code: "U0155",
    description: "Lost Communication With Instrument Panel Control Module",
    category: "Network",
    severity: "Low",
    system: "Communication",
  },
];

/**
 * DTC Code Service for searching and filtering
 */
class DTCCodeService {
  private codes: DTCCode[] = DTC_CODES;

  /**
   * Search DTC codes by code or description
   */
  searchCodes(query: string): DTCCode[] {
    if (!query.trim()) {
      return this.codes.slice(0, 20); // Return first 20 if no query
    }

    const searchTerm = query.toLowerCase();
    return this.codes
      .filter(
        (dtc) =>
          dtc.code.toLowerCase().includes(searchTerm) ||
          dtc.description.toLowerCase().includes(searchTerm) ||
          dtc.system.toLowerCase().includes(searchTerm)
      )
      .slice(0, 15); // Limit to 15 results for performance
  }

  /**
   * Get codes by category
   */
  getCodesByCategory(category: DTCCode["category"]): DTCCode[] {
    return this.codes.filter((dtc) => dtc.category === category);
  }

  /**
   * Get codes by severity
   */
  getCodesBySeverity(severity: DTCCode["severity"]): DTCCode[] {
    return this.codes.filter((dtc) => dtc.severity === severity);
  }

  /**
   * Get codes by system
   */
  getCodesBySystem(system: string): DTCCode[] {
    return this.codes.filter((dtc) => dtc.system === system);
  }

  /**
   * Get unique systems
   */
  getSystems(): string[] {
    const systems = [...new Set(this.codes.map((dtc) => dtc.system))];
    return systems.sort();
  }

  /**
   * Get unique categories
   */
  getCategories(): DTCCode["category"][] {
    return ["Powertrain", "Body", "Chassis", "Network"];
  }

  /**
   * Find exact code
   */
  findCode(code: string): DTCCode | undefined {
    return this.codes.find(
      (dtc) => dtc.code.toUpperCase() === code.toUpperCase()
    );
  }

  /**
   * Validate DTC code format
   */
  validateCodeFormat(code: string): boolean {
    // DTC codes should be in format: Letter + 4 digits (e.g., P0301, B0004, C0121, U0100)
    const dtcPattern = /^[PBCU]\d{4}$/i;
    return dtcPattern.test(code);
  }

  /**
   * Get all codes (for testing/development)
   */
  getAllCodes(): DTCCode[] {
    return [...this.codes];
  }
}

export const dtcCodeService = new DTCCodeService();
