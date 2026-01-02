
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAIService } from './services/openai.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const aiService = new OpenAIService();

// Middleware
// Fix: Use 'as any' casting to resolve type mismatch error between cors middleware return type and express app.use expectation.
app.use(cors({
  origin: '*', // Di produksi, ganti dengan domain frontend Anda
  methods: ['GET', 'POST']
}) as any);
// Fix: Use 'as any' casting to bypass type mismatch error where express.json() is mistaken for a PathParams instead of a middleware.
app.use(express.json({ limit: '50mb' }) as any);

// Database Connection (Fallback to LocalStorage/Mock if DB_HOST is missing)
let db: any = null;
if (process.env.DB_HOST) {
    db = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10
    });
}

// --- API ROUTES ---

app.post('/api/analyze', async (req, res) => {
    try {
        const { patient, language } = req.body;
        if (!patient) return res.status(400).json({ error: "Missing patient data" });
        
        const result = await aiService.analyzePatient(patient, language || 'English');
        res.json(result);
    } catch (error: any) {
        console.error("AI Controller Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/health', (req, res) => res.json({ 
    status: 'OK', 
    engine: 'Alcortex AI v1 Active',
    timestamp: new Date().toISOString()
}));

app.listen(PORT, () => {
    console.log(`Alcortex Backend running on port ${PORT}`);
});
