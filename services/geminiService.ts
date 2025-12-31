
import { GoogleGenAI, Type } from "@google/genai";
import { PatientData, DiagnosisOutput, Language } from "../types";

export const analyzePatientData = async (
  patient: PatientData, 
  language: Language = Language.EN,
  imageUri?: string
): Promise<DiagnosisOutput> => {
  // Always create instance inside the function for the latest API Key
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) {
    throw new Error("An API Key must be set when running in a browser. Please select your API key.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = "gemini-3-pro-preview";
  
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
    6. Return ONLY valid JSON.
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
    if (!text) throw new Error("AI response was empty.");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Execution Error:", error);
    
    // Handle specific AI Studio error for missing project key selection
    if (error.message?.includes("Requested entity was not found") && typeof window.aistudio !== 'undefined') {
      await window.aistudio.openSelectKey();
      throw new Error("Session expired or project missing. Please re-select your API key and try again.");
    }
    
    throw new Error(error.message || "AI Synthesis failed. Please check network and API configuration.");
  }
};
