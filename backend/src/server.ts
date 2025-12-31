
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import { config } from './config/env';
import { analyzePatient } from './controllers/ai.controller';

const app = express();
const PORT = config.port;

// Middleware
app.use(cors());

// Fix: Cast express.json middleware to any to prevent the compiler from misinterpreting it as PathParams in app.use.
app.use(express.json({ limit: '50mb' }) as any);

// Database Connection Pool
const db = mysql.createPool({
    ...config.db,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        console.log('Pastikan MySQL berjalan dan database "alcortex_db" sudah dibuat.');
    } else {
        console.log('Connected to MySQL Database (Alcortex)');
        connection.release();
    }
});

// --- API ROUTES ---
app.post('/api/analyze', analyzePatient);

app.post('/api/users/register', (req, res) => {
    const { name, professionId, language, email } = req.body;
    const query = 'INSERT INTO users (name, professionId, language, email) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = ?, professionId = ?, language = ?';
    db.execute(query, [name, professionId, language, email, name, professionId, language], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User registered successfully' });
    });
});

app.get('/api/records', (req, res) => {
    db.query('SELECT * FROM records ORDER BY created_at DESC', (err, results: any) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = results.map((row: any) => ({
            id: row.recordId,
            date: row.created_at,
            patient: JSON.parse(row.patientData),
            analysis: JSON.parse(row.analysisResult)
        }));
        res.json(formatted);
    });
});

// Health Check Endpoint - Menandakan engine AI yang digunakan (OpenAI GPT-4o)
app.get('/api/health', (req, res) => res.json({ 
    status: 'OK', 
    engine: 'GPT-4o Ready',
    timestamp: new Date().toISOString()
}));

app.listen(PORT, () => {
    console.log(`Alcortex Backend organized at http://localhost:${PORT}`);
});
