
export enum Language { ID = 'Bahasa Indonesia', EN = 'English', RU = 'Russian' }
export interface User { name: string; professionId: string; language: Language; email: string; }
export interface LabResult { parameter: string; value: string; unit: string; referenceRange: string; }
export interface Vitals { bpSystolic: string; bpDiastolic: string; heartRate: string; respiratoryRate: string; temperature: string; spo2: string; weight: string; height: string; }
export type SmokingLevel = 'None' | 'Passive' | 'Active' | 'Heavy';
export type AlcoholLevel = 'None' | 'Occasional' | 'Active' | 'Heavy';
export interface PatientData { name: string; rmNo: string; dob: string; age: number; gender: 'Male' | 'Female' | 'Other'; bloodType: string; history: string; meds: string; allergies: string; smoking: SmokingLevel; alcohol: AlcoholLevel; activity: string; complaints: string; vitals: Vitals; labBlood: LabResult[]; labUrine: LabResult[]; labSputum: LabResult[]; }
export interface DiagnosisOutput { mainDiagnosis: string; differentials: Array<{ diagnosis: string; icd10: string; confidence: number; }>; severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical'; confidenceScore: number; interpretation: string; safetyWarning: string; followUp: string; medicationRecs: string; }
export interface SavedRecord { id: string; date: string; patient: PatientData; analysis: DiagnosisOutput; }
