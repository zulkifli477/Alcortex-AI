import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import { config } from './config/env';
import { analyzePatient } from './controllers/ai.controller';

const app = express();
const PORT = config.port;

app.use(cors());
/**
 * Explicit cast to any to resolve potential Type mismatch between express.json 
 * and RequestHandler in some TypeScript/Express version combinations.
 */
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

app.get('/api/health', (req, res) => res.json({ 
    status: 'OK', 
    engine: 'Alcortex Neural Engine Ready',
    timestamp: new Date().toISOString()
}));

app.listen(PORT, () => {
    console.log(`Alcortex Backend running on http://localhost:${PORT}`);
});