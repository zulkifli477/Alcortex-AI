
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'alcortex_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Check Connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        console.log('Ensure MySQL is running and database "alcortex_db" exists.');
    } else {
        console.log('Connected to MySQL Database');
        connection.release();
    }
});

// --- API ROUTES ---

// 1. Register User
app.post('/api/users/register', (req, res) => {
    const { name, professionId, language, email } = req.body;
    const query = 'INSERT INTO users (name, professionId, language, email) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = ?, professionId = ?, language = ?';
    
    db.execute(query, [name, professionId, language, email, name, professionId, language], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error during registration' });
        }
        res.json({ message: 'User registered successfully' });
    });
});

// 2. Log Activity
app.post('/api/activity', (req, res) => {
    const { email, action } = req.body;
    const query = 'INSERT INTO activity_logs (email, action) VALUES (?, ?)';
    
    db.execute(query, [email, action], (err) => {
        if (err) console.error('Logging failed:', err);
        res.json({ status: 'Logged' });
    });
});

// 3. Save Diagnosis Record
app.post('/api/records', (req, res) => {
    const { userEmail, recordId, patientName, rmNo, patientData, analysisResult } = req.body;
    const query = 'INSERT INTO records (userEmail, recordId, patientName, rmNo, patientData, analysisResult) VALUES (?, ?, ?, ?, ?, ?)';
    
    // Store objects as JSON strings for MySQL JSON type
    db.execute(query, [
        userEmail, 
        recordId, 
        patientName, 
        rmNo, 
        JSON.stringify(patientData), 
        JSON.stringify(analysisResult)
    ], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to save record' });
        }
        res.json({ message: 'Record saved to EMR Vault' });
    });
});

// 4. Get All Records
app.get('/api/records', (req, res) => {
    const query = 'SELECT * FROM records ORDER BY created_at DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to fetch records' });
        }
        
        // Map data back from JSON strings to Objects
        const formattedResults = results.map(row => ({
            id: row.recordId,
            date: row.created_at,
            patient: typeof row.patientData === 'string' ? JSON.parse(row.patientData) : row.patientData,
            analysis: typeof row.analysisResult === 'string' ? JSON.parse(row.analysisResult) : row.analysisResult
        }));
        
        res.json(formattedResults);
    });
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', database: 'Connected' });
});

app.listen(PORT, () => {
    console.log(`Alcortex Backend running on http://localhost:${PORT}`);
});
