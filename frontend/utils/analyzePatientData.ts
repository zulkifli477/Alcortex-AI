import { PatientData, DiagnosisOutput, Language } from '../types';
import { apiService } from '../services/api';

/**
 * Wrapper to analyze patient data via the API backend.
 */
export const analyzePatientData = async (
  patient: PatientData,
  language: Language = Language.EN,
  imageUri?: string
): Promise<DiagnosisOutput> => {
  try {
    return await apiService.analyzePatient(patient, language, imageUri);
  } catch (error: any) {
    console.error('analyzePatientData error:', error);
    throw new Error(error?.message || 'Analysis failed');
  }
};