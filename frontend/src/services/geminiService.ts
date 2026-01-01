
import { GoogleGenAI, Type } from "@google/genai";
import { PatientData, DiagnosisOutput, Language } from "../types";

export const analyzePatientData = async (
  patient: PatientData, 
  language: Language = Language.EN,
  imageUri?: string
): Promise<DiagnosisOutput> => {
  if (!process.env.API_KEY) throw new Error("API Key missing.");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze patient ${patient.name} (${patient.age}Y) with complaints: ${patient.complaints}. 
                  Language: ${language}. Return JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mainDiagnosis: { type: Type.STRING },
          differentials: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { diagnosis: { type: Type.STRING }, icd10: { type: Type.STRING }, confidence: { type: Type.NUMBER } } } },
          severity: { type: Type.STRING },
          confidenceScore: { type: Type.NUMBER },
          interpretation: { type: Type.STRING },
          safetyWarning: { type: Type.STRING },
          followUp: { type: Type.STRING },
          medicationRecs: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
};
