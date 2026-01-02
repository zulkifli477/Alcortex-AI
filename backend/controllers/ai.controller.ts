
import { OpenAIService } from "../services/openai.service";

const openai = new OpenAIService();

export const analyzePatient = async (req: any, res: any) => {
  try {
    const { patient, language, imageUri } = req.body;
    if (!patient) return res.status(400).json({ error: "Missing patient data" });

    const result = await openai.analyzePatient(patient, language, imageUri);
    res.json(result);
  } catch (error: any) {
    console.error("Controller Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const healthCheck = (req: any, res: any) => {
  res.json({
    status: 'OK',
    engine: 'Alcortex AI v1 Active',
    timestamp: new Date().toISOString()
  });
}; 