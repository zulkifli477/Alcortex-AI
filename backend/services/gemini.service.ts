
import { GoogleGenAI, Type } from "@google/genai";
// Fixed path to point correctly to root types.ts
import { PatientData, DiagnosisOutput } from "../../types";

export class GeminiService {
  // Guidelines: Always create instance inside the function for the latest API Key
  // GUIDELINE FIX: Removed class-level ai property to ensure per-call initialization.

  async analyzePatient(patient: PatientData, language: string): Promise<DiagnosisOutput> {
    // Guidelines: Initialization must use a named parameter {apiKey: ...}
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-preview';

    // Stringify lab data for the prompt
    const labs = `
      - BLOOD LAB: ${JSON.stringify(patient.labBlood)}
      - URINE LAB: ${JSON.stringify(patient.labUrine)}
      - SPUTUM LAB: ${JSON.stringify(patient.labSputum)}
    `;

    const prompt = `
      Perform a highly professional and precise medical diagnosis. 
      The response MUST be entirely in ${language}.
      
      You MUST analyze the correlation between ALL these parameters:
      
      1. SUBJECTIVE DATA:
         - Main Complaints: ${patient.complaints}
         - Medical History: ${patient.history}
         - Allergies & Current Medications: ${patient.meds}
      
      2. OBJECTIVE DATA (VITALS):
         - BP: ${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic} mmHg
         - Heart Rate: ${patient.vitals.heartRate} bpm
         - Resp Rate: ${patient.vitals.respiratoryRate}/min
         - Temperature: ${patient.vitals.temperature}°C
         - SpO2: ${patient.vitals.spo2}%
      
      3. LIFESTYLE FACTORS:
         - Smoking: ${patient.smoking}
         - Alcohol: ${patient.alcohol}
      
      4. LABORATORY MARKERS:
         ${labs}

      INSTRUCTIONS:
      - Correlate lab abnormalities with clinical symptoms and history.
      - Provide a main diagnosis, differential diagnoses with ICD-10 codes, and a detailed clinical interpretation.
      - Include specific medication recommendations and safety warnings.
      - Output MUST be valid JSON according to the schema.
    `;

    try {
      // Guidelines: Use ai.models.generateContent to query GenAI with both the model name and prompt.
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mainDiagnosis: { type: Type.STRING },
              differentials: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    diagnosis: { type: Type.STRING },
                    icd10: { type: Type.STRING },
                    confidence: { type: Type.NUMBER }
                  },
                  required: ["diagnosis", "icd10", "confidence"]
                }
              },
              severity: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER },
              interpretation: { type: Type.STRING },
              safetyWarning: { type: Type.STRING },
              followUp: { type: Type.STRING },
              medicationRecs: { type: Type.STRING }
            },
            required: ["mainDiagnosis", "differentials", "severity", "confidenceScore", "interpretation", "safetyWarning", "followUp", "medicationRecs"]
          }
        }
      });

      // Guidelines: Use .text property (not a method) to extract output string
      const jsonStr = response.text || "{}";
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("AI Service Error:", error);
      throw new Error("Neural Engine processing failed.");
    }
  }
}
