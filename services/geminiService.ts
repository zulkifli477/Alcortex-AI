import { GoogleGenAI, Type } from "@google/genai";
import { PatientData, DiagnosisOutput, Language } from "../types";

export const analyzePatientData = async (
  patient: PatientData, 
  language: Language = Language.EN,
  imageUri?: string
): Promise<DiagnosisOutput> => {
  // Always obtain API Key from process.env.API_KEY
  if (!process.env.API_KEY) {
    throw new Error("Missing API Key. Ensure process.env.API_KEY is configured.");
  }

  // Guidelines: Instantiate client right before use
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-3-pro-preview';
  
  const labDataString = `
    - BLOOD PANEL: ${JSON.stringify(patient.labBlood)}
    - URINE ANALYSIS: ${JSON.stringify(patient.labUrine)}
    - SPUTUM ANALYSIS: ${JSON.stringify(patient.labSputum)}
  `;

  const vitalsString = `
    BP: ${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic} mmHg, 
    HR: ${patient.vitals.heartRate} bpm, 
    Temp: ${patient.vitals.temperature} C, 
    SpO2: ${patient.vitals.spo2}%
  `;

  const prompt = `
    You are Alcortex AI, a senior clinical diagnostic system. 
    Analyze the following patient data and provide a rigorous medical report.
    Language of response: ${language}.
    
    PATIENT: ${patient.name} (${patient.age}Y, ${patient.gender})
    COMPLAINTS: ${patient.complaints}
    HISTORY: ${patient.history}
    VITALS: ${vitalsString}
    LABS: ${labDataString}
    ${imageUri ? "An imaging scan is provided. Correlate visual pathology with clinical lab markers." : ""}

    OUTPUT REQUIREMENTS:
    1. Main Diagnosis (High specificity).
    2. Differential Stack (Top 3) with ICD-10.
    3. Clinical Interpretation (Linking labs to symptoms).
    4. Follow-up plan & Medication recommendations.
    5. Safety Warnings.
    6. Return ONLY valid JSON according to the required schema.
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

    // Guidelines: Use generateContent with config.responseSchema
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
          required: [
            "mainDiagnosis", "differentials", "severity", 
            "confidenceScore", "interpretation", "safetyWarning", 
            "followUp", "medicationRecs"
          ]
        }
      }
    });

    // Guidelines: Access response.text property directly
    const text = response.text;
    if (!text) throw new Error("Neural Engine failed to return a report.");
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error("AI Service Execution Error:", error);
    throw new Error(error.message || "AI Synthesis failed. Check configuration.");
  }
};