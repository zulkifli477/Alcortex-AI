
import { PatientData, DiagnosisOutput, Language } from "../../types";

/**
 * apiService bertindak sebagai bridge ke Backend.
 * Semua pemrosesan AI sekarang dilakukan di sisi server (GPT-4o).
 */
export const apiService = {
  async analyzePatient(
    patient: PatientData, 
    language: Language, 
    imageUri?: string
  ): Promise<DiagnosisOutput> {
    try {
      const response = await fetch('/api/analyze', {
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
