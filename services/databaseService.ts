
import { User, SavedRecord } from '../types';

// Alamat server backend Anda
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Service ini sekarang terhubung ke REAL MySQL via Express API.
 */
export const databaseService = {
  // --- USER & AUTH LOGIC ---
  async registerUser(user: User): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (!response.ok) throw new Error('Failed to register user');
    } catch (error) {
      console.error('[DB ERROR] User registration failed:', error);
      // Fallback ke localStorage jika server mati
      const users = this.getUsersLocal();
      if (!users.find(u => u.email === user.email)) {
        users.push(user);
        localStorage.setItem('alcortex_db_users', JSON.stringify(users));
      }
    }
  },

  getUsersLocal(): User[] {
    const data = localStorage.getItem('alcortex_db_users');
    return data ? JSON.parse(data) : [];
  },

  // --- ACTIVITY LOGGING ---
  async logActivity(email: string, action: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action })
      });
      console.log(`[DB LOG] MySQL: User ${email} performed ${action}`);
    } catch (error) {
      console.warn('[DB LOG] Fallback: Server offline, logging to console only.');
    }
  },

  // --- EMR & DIAGNOSIS LOGIC ---
  async saveDiagnosis(userEmail: string, record: SavedRecord): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          recordId: record.id,
          patientName: record.patient.name,
          rmNo: record.patient.rmNo,
          patientData: record.patient,
          analysisResult: record.analysis
        })
      });
      if (!response.ok) throw new Error('Server rejected save');
    } catch (error) {
      console.error('[DB ERROR] Failed to save to MySQL:', error);
      // Simpan lokal sebagai cadangan
      const records = this.getRecordsLocal();
      records.unshift(record);
      localStorage.setItem('alcortex_emr_vault', JSON.stringify(records));
    }
  },

  async getRecords(): Promise<SavedRecord[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/records`);
      if (response.ok) {
        return await response.json();
      }
      return this.getRecordsLocal();
    } catch (error) {
      return this.getRecordsLocal();
    }
  },

  getRecordsLocal(): SavedRecord[] {
    const data = localStorage.getItem('alcortex_emr_vault');
    return data ? JSON.parse(data) : [];
  }
};
