
import { User, SavedRecord } from '../types';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    // Handle GitHub Codespaces forwarded ports logic
    if (hostname.includes('github.dev') || hostname.includes('preview.app.github.dev')) {
      const parts = hostname.split('-');
      // Replace the frontend port (3000 or similar) with backend port 5000
      const baseUrl = hostname.replace(/-\d+\.app\.github\.dev/, '-5000.app.github.dev');
      return `https://${baseUrl}/api`;
    }
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseUrl();

export const databaseService = {
  async registerUser(user: User): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
    } catch (error) {
      const users = this.getUsersLocal();
      if (!users.find(u => u.email === user.email)) {
        users.push(user);
        localStorage.setItem('alcortex_db_users', JSON.stringify(users));
      }
    }
  },

  getUsersLocal(): User[] {
    try {
      const data = localStorage.getItem('alcortex_db_users');
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },

  async logActivity(email: string, action: string): Promise<void> {
    try {
      fetch(`${API_BASE_URL}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action })
      }).catch(() => {});
    } catch (error) {}
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
      if (!response.ok) throw new Error();
    } catch (error) {
      const records = this.getRecordsLocal();
      records.unshift(record);
      localStorage.setItem('alcortex_emr_vault', JSON.stringify(records));
    }
  },

  async getRecords(): Promise<SavedRecord[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/records`);
      if (response.ok) return await response.json();
      return this.getRecordsLocal();
    } catch (error) {
      return this.getRecordsLocal();
    }
  },

  getRecordsLocal(): SavedRecord[] {
    try {
      const data = localStorage.getItem('alcortex_emr_vault');
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  }
};
