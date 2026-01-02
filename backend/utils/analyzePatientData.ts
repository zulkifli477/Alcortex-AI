import { PatientData } from "../types";

export type AnalyzeResult = {
  labs: {
    blood: Record<string, unknown>;
    urine: Record<string, unknown>;
    sputum: Record<string, unknown>;
  };
  vitals: Record<string, unknown>;
  subjective: {
    complaints?: string;
    history?: string;
    meds?: string;
    smoking?: string;
    alcohol?: string;
  };
  summary: string;
};

export default function analyzePatientData(patient: PatientData): AnalyzeResult {
  const labs = {
    blood: patient.labBlood ?? {},
    urine: patient.labUrine ?? {},
    sputum: patient.labSputum ?? {}
  };

  const vitals = {
    bp: `${patient.vitals?.bpSystolic ?? "?"}/${patient.vitals?.bpDiastolic ?? "?"}`,
    heartRate: patient.vitals?.heartRate,
    respiratoryRate: patient.vitals?.respiratoryRate,
    temperature: patient.vitals?.temperature,
    spo2: patient.vitals?.spo2
  };

  const subjective = {
    complaints: patient.complaints,
    history: patient.history,
    meds: patient.meds,
    smoking: patient.smoking,
    alcohol: patient.alcohol
  };

  const summary = `Complaints: ${subjective.complaints || "N/A"}; Vitals: BP ${vitals.bp}, HR ${vitals.heartRate ?? "N/A"}, RR ${vitals.respiratoryRate ?? "N/A"}, Temp ${vitals.temperature ?? "N/A"}; Labs: blood ${JSON.stringify(labs.blood)}, urine ${JSON.stringify(labs.urine)}, sputum ${JSON.stringify(labs.sputum)}.`;

  return { labs, vitals, subjective, summary };
}