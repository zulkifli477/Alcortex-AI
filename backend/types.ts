export type PatientData = {
  labBlood?: Record<string, unknown>;
  labUrine?: Record<string, unknown>;
  labSputum?: Record<string, unknown>;
  vitals?: {
    bpSystolic?: number;
    bpDiastolic?: number;
    heartRate?: number;
    respiratoryRate?: number;
    temperature?: number;
    spo2?: number;
  };
  complaints?: string;
  history?: string;
  meds?: string;
  smoking?: string;
  alcohol?: string;
};