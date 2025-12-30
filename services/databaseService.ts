
import { User, SavedRecord } from '../types';

/**
 * Logika untuk mendapatkan URL API yang benar.
 * Jika di Codespaces, kita harus menggunakan URL forwarded, bukan localhost.
 */
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Jika di Codespaces, URL biasanya berbentuk *-3000.app.github.dev
    // Kita ganti port 3000 ke 5000 untuk backend
    if (hostname.includes('github.dev') || hostname.includes('preview.app.github.dev')) {
      return `https://${hostname.replace('-3000', '-5000')}/api`;
    }
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseUrl();

export const databaseService = {
  async registerUser(user: User): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error('Failed to register user');
    } catch (error) {
      console.warn('[DB INFO] Using local storage for user registration (Backend offline)');
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

  async logActivity(email: string, action: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action })
      });
    } catch (error) {
      // Silent fail for logs
    }
  },

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
      console.error('[DB ERROR] Saving to Local (Backend offline)');
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
