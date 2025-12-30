import { GoogleGenAI, Type } from "@google/genai";
import { PatientData, DiagnosisOutput, Language } from "../types";

export const analyzePatientData = async (
  patient: PatientData, 
  language: Language = Language.EN,
  imageUri?: string
): Promise<DiagnosisOutput> => {
  const apiKey = process.env.API_KEY;
  
  // Create a fresh instance for every call as per guidelines
  const ai = new GoogleGenAI({ apiKey: apiKey || "" });
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
    Translate all medical terms, descriptions, and recommendations into ${language}.
    
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
    ${imageUri ? "An imaging scan (X-ray/CT) is also provided for visual analysis." : ""}

    Provide:
    1. Main Diagnosis
    2. 3 Differentials with ICD-10 codes
    3. Severity (Mild/Moderate/Severe/Critical)
    4. Confidence Score (0-1)
    5. Detailed clinical interpretation of findings
    6. Safety warnings/contraindications
    7. Clear follow-up recommendations
    8. Recommended medications/interventions
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

    const text = response.text;
    if (!text) {
      throw new Error("EMPTY_RESPONSE: The AI model returned an empty response.");
    }

    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini AI Analysis Error:", error);
    throw error;
  }
};