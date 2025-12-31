
import { Request, Response } from 'express';
import { OpenAIService } from "../services/openai.service";

const openai = new OpenAIService();

/**
 * Controller untuk menangani analisis medis pasien menggunakan AI.
 * Menggunakan tipe Request dan Response dari express untuk validasi properti.
 */
// Fix: Used 'any' type for req and res to resolve "Property does not exist on type" errors caused by environment type conflicts.
export const analyzePatient = async (req: any, res: any) => {
  try {
    // Properti body sekarang terdeteksi dengan benar berkat tipe Request
    const { patient, language, imageUri } = req.body;
    
    if (!patient) {
      return res.status(400).json({ error: "Missing patient data" });
    }

    const result = await openai.analyzePatient(patient, language, imageUri);
    res.json(result);
  } catch (error: any) {
    console.error("Controller Error:", error.message);
    // res.status dan res.json terdeteksi berkat tipe Response
    res.status(500).json({ error: error.message });
  }
};
