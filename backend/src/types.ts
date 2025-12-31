
export interface LabResult {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
}

export interface Vitals {
  bpSystolic: string;
  bpDiastolic: string;
  heartRate: string;
  respiratoryRate: string;
  temperature: string;
  spo2: string;
  weight: string;
  height: string;
}

export interface PatientData {
  name: string;
  rmNo: string;
  dob: string;
  age: number;
  gender: string;
  bloodType: string;
  history: string;
  meds: string;
  allergies: string;
  smoking: string;
  alcohol: string;
  activity: string;
  complaints: string;
  vitals: Vitals;
  labBlood: LabResult[];
  labUrine: LabResult[];
  labSputum: LabResult[];
}

export interface DiagnosisOutput {
  mainDiagnosis: string;
  differentials: Array<{
    diagnosis: string;
    icd10: string;
    confidence: number;
  }>;
  severity: string;
  confidenceScore: number;
  interpretation: string;
  safetyWarning: string;
  followUp: string;
  medicationRecs: string;
}
