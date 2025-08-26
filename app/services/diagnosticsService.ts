// diagnosticsService.ts
// Calculation helpers for vehicle diagnostics summary
import { VehicleDiagnostics } from "../contexts/VehicleDiagnosticsContext";

export function getEngineStatus(dtcCodes: string[]): string {
  return dtcCodes.length === 0 ? "Good" : "Check Engine";
}

export function getOilLife(
  milesSinceLastChange: number,
  milesBetweenChanges: number
): number {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round((1 - milesSinceLastChange / milesBetweenChanges) * 100)
    )
  );
}

export function getBatteryStatus(batteryVoltage: number): string {
  return batteryVoltage > 12
    ? `Good (${batteryVoltage}V)`
    : `Check Battery (${batteryVoltage}V)`;
}

export function getBrakeLife(
  milesSinceLastBrakeService: number,
  milesBetweenBrakeService: number
): number {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (1 - milesSinceLastBrakeService / milesBetweenBrakeService) * 100
      )
    )
  );
}

export function getBrakeStatus(brakeLife: number): string {
  return brakeLife > 30
    ? `Fair (${brakeLife}%)`
    : `Check Brakes (${brakeLife}%)`;
}
