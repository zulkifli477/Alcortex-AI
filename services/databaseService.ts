
import { User, SavedRecord } from '../types';

/**
 * databaseService handles all data persistence.
 * In this standalone version, it uses localStorage to ensure
 * the app works immediately on any static hosting (like Netlify).
 */
export const databaseService = {
  // --- USER MANAGEMENT ---
  async registerUser(user: User): Promise<void> {
    try {
      const users = this.getUsersLocal();
      const exists = users.find(u => u.email === user.email);
      if (!exists) {
        users.push(user);
        localStorage.setItem('alcortex_db_users', JSON.stringify(users));
      }
    } catch (error) {
      console.error("Storage error:", error);
    }
  },

  getUsersLocal(): User[] {
    try {
      const data = localStorage.getItem('alcortex_db_users');
      return data ? JSON.parse(data) : [];
    } catch (e) { 
      return []; 
    }
  },

  // --- ACTIVITY LOGS ---
  async logActivity(email: string, action: string): Promise<void> {
    try {
      const logs = JSON.parse(localStorage.getItem('alcortex_logs') || '[]');
      logs.push({ email, action, timestamp: new Date().toISOString() });
      // Keep only last 50 logs to save space
      localStorage.setItem('alcortex_logs', JSON.stringify(logs.slice(-50)));
    } catch (error) {}
  },

  // --- RECORD MANAGEMENT (EMR) ---
  async saveDiagnosis(userEmail: string, record: SavedRecord): Promise<void> {
    try {
      const records = this.getRecordsLocal();
      // Prevent duplicates
      const filtered = records.filter(r => r.id !== record.id);
      filtered.unshift(record);
      localStorage.setItem('alcortex_emr_vault', JSON.stringify(filtered));
    } catch (error) {
      console.error("Failed to save record locally:", error);
    }
  },

  async getRecords(): Promise<SavedRecord[]> {
    // Returns data directly from local storage
    return this.getRecordsLocal();
  },

  getRecordsLocal(): SavedRecord[] {
    try {
      const data = localStorage.getItem('alcortex_emr_vault');
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { 
      return []; 
    }
  }
};
