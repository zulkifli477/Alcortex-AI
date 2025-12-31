import { User, SavedRecord } from '../types';

/**
 * databaseService handles all data persistence.
 * Uses localStorage with enhanced consistency checks.
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

  // --- RECORD MANAGEMENT (EMR) ---
  async saveDiagnosis(userEmail: string, record: SavedRecord): Promise<void> {
    try {
      const records = this.getRecordsLocal();
      // Ensure we don't duplicate records with same ID
      const filtered = records.filter(r => r.id !== record.id);
      
      // Store new record at the top
      const updated = [record, ...filtered];
      
      // Keep EMR vault at a reasonable size (e.g., 200 records) to avoid localStorage limits
      localStorage.setItem('alcortex_emr_vault', JSON.stringify(updated.slice(0, 200)));
      
      // Trigger a storage event for cross-tab sync if necessary
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
      
      // Ensure records are sorted by date descending
      return parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) { 
      console.error("Critical error parsing EMR Vault:", e);
      return []; 
    }
  }
};