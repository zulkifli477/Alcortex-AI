import { User, SavedRecord } from '../types';

export const databaseService = {
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

  async saveDiagnosis(userEmail: string, record: SavedRecord): Promise<void> {
    try {
      const records = this.getRecordsLocal();
      const filtered = records.filter(r => r.id !== record.id);
      const updated = [record, ...filtered];
      localStorage.setItem('alcortex_emr_vault', JSON.stringify(updated.slice(0, 200)));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error("Failed to save record locally:", error);
    }
  },

  async getRecords(): Promise<SavedRecord[]> {
    return this.getRecordsLocal();
  },

  getRecordsLocal(): SavedRecord[] {
    try {
      const data = localStorage.getItem('alcortex_emr_vault');
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) { 
      return []; 
    }
  }
};