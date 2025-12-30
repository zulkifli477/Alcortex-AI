import { GoogleGenAI, Type } from "@google/genai";
import { PatientData, DiagnosisOutput, Language } from "../types";

export const analyzePatientData = async (
  patient: PatientData, 
  language: Language = Language.EN,
  imageUri?: string
): Promise<DiagnosisOutput> => {
  // Fix: Initialize GoogleGenAI directly with process.env.API_KEY per SDK guidelines.
  // Assume API_KEY is pre-configured and accessible.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = "gemini-3-pro-preview";
  
  const labDataString = `
    Blood: ${JSON.stringify(patient.labBlood)}
    Urine: ${JSON.stringify(patient.labUrine)}
    Sputum: ${JSON.stringify(patient.labSputum)}
  `;

  const vitalsString = `
    Blood Pressure: ${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic} mmHg
    Heart Rate: ${patient.vitals.heartRate} bpm
    Respiratory Rate: ${patient.vitals.respiratoryRate} /min
    Temperature: ${patient.vitals.temperature} °C
    SpO2: ${patient.vitals.spo2}%
    Weight: ${patient.vitals.weight} kg
    Height: ${patient.vitals.height} cm
  `;

  const prompt = `
    Perform a professional clinical diagnosis for the following patient data.
    IMPORTANT: You must provide the entire response in ${language}. 
    
    Name: ${patient.name}
    Age: ${patient.age}
    Gender: ${patient.gender}
    Complaints: ${patient.complaints}
    History: ${patient.history}
    Meds: ${patient.meds}
    Allergies: ${patient.allergies}
    Lifestyle: Smoking: ${patient.smoking}, Alcohol: ${patient.alcohol}, Activity: ${patient.activity}
    Vital Signs: ${vitalsString}
    Laboratory Data: ${labDataString}
    ${imageUri ? "An imaging scan is also provided for visual analysis." : ""}

    Provide the output in JSON format with specific keys: mainDiagnosis, differentials (array of {diagnosis, icd10, confidence}), severity, confidenceScore, interpretation, safetyWarning, followUp, medicationRecs.
  `;

  try {
    const parts: any[] = [{ text: prompt }];
    
    if (imageUri) {
      const base64Data = imageUri.split(',')[1];
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      });
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
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

    // Fix: Directly access the .text property (not a method) from GenerateContentResponse
    const text = response.text;
    if (!text) throw new Error("Gagal mendapatkan respon dari AI.");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
};