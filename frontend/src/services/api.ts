
import { PatientData, DiagnosisOutput, Language } from "../types";

// Pastikan VITE_API_URL diatur di Netlify/Environment Variables
// Fix: Use type casting to 'any' for import.meta to resolve "Property 'env' does not exist on type 'ImportMeta'" error.
const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '';

export const apiService = {
  async analyzePatient(
    patient: PatientData, 
    language: Language, 
    imageUri?: string
  ): Promise<DiagnosisOutput> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patient, language, imageUri }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Network response was not ok');
      }

      return await response.json();
    } catch (error: any) {
      console.error("API Service Error:", error);
      throw error;
    }
  }
};
