export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  cars: number[];
};

export type Car = {
  id: number;
  make: string;
  model: string;
  year: number;
  color: string;
  vin: string;
};

export type Diagnostic = {
  code: string;
  description: string;
  severity: "High" | "Moderate" | "Low";
  details: string;
  dateDetected: string;
};

export type DiagnosticData = {
  user: User | null;
  car: Car | null;
  diagnostic: Diagnostic | null;
};
