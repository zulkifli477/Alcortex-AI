import OpenAI from "openai";
import { PatientData, DiagnosisOutput } from "../types";
import { config } from "../config/env";

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
    });
  }

  async analyzePatient(patient: PatientData, language: string, imageUri?: string): Promise<DiagnosisOutput> {
    const labs = `
      - BLOOD LAB: ${JSON.stringify(patient.labBlood)}
      - URINE LAB: ${JSON.stringify(patient.labUrine)}
      - SPUTUM LAB: ${JSON.stringify(patient.labSputum)}
    `;

    const vitals = `
      BP: ${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic}, 
      HR: ${patient.vitals.heartRate}, 
      Temp: ${patient.vitals.temperature}, 
      SpO2: ${patient.vitals.spo2}
    `;

    const systemPrompt = `
      You are Alcortex AI, a world-class clinical diagnostic system. 
      Analyze the medical data and return a structured diagnostic report.
      Response language: ${language}.
      Output format: JSON only.
    `;

    const userPrompt = `
      Analyze this patient data:
      - NAME: ${patient.name} (${patient.age}y, ${patient.gender})
      - COMPLAINTS: ${patient.complaints}
      - HISTORY: ${patient.history}
      - VITALS: ${vitals}
      - LABS: ${labs}
      
      Requirements:
      1. mainDiagnosis (Specific)
      2. differentials (Array of {diagnosis, icd10, confidence})
      3. severity (Mild, Moderate, Severe, Critical)
      4. confidenceScore (0 to 1)
      5. interpretation (Detailed clinical analysis)
      6. safetyWarning (Urgent warnings)
      7. followUp (Management plan)
      8. medicationRecs (Therapeutics)
    `;

    try {
      const messages: any[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ];

      if (imageUri) {
        messages[1].content = [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: imageUri } }
        ];
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("Empty response from OpenAI");

      return JSON.parse(content) as DiagnosisOutput;
    } catch (error: any) {
      console.error("OpenAI Service Error:", error);
      throw new Error(`AI synthesis failed: ${error.message}`);
    }
  }
}