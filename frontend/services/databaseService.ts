import { SavedRecord } from '../types';

const STORAGE_KEY = 'alcortex_records';

const delay = (ms = 250) => new Promise(res => setTimeout(res, ms));

export const databaseService = {
  async getRecords(): Promise<SavedRecord[]> {
    await delay(200);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as SavedRecord[];
    } catch (e) {
      console.warn('Failed to parse records from storage', e);
      return [];
    }
  },

  async saveDiagnosis(userEmail: string, record: SavedRecord): Promise<void> {
    await delay(200);
    const records = await this.getRecords();

    // Use a simple id/timestamp if missing
    const id = (record as any).id ?? `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const timestamp = (record as any).createdAt ?? new Date().toISOString();

    const storedRecord: SavedRecord = {
      ...record,
      ...(record as any).id ? {} : { id },
      ...(record as any).createdAt ? {} : { createdAt: timestamp },
      ...(record as any).owner ? {} : { owner: userEmail } as any,
    } as SavedRecord;

    const idx = records.findIndex(r => (r as any).id === id);
    if (idx >= 0) {
      records[idx] = { ...records[idx], ...storedRecord };
    } else {
      records.push(storedRecord);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  },

  async deleteRecord(id: string): Promise<void> {
    await delay(150);
    const records = await this.getRecords();
    const filtered = records.filter(r => (r as any).id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  async getRecordById(id: string): Promise<SavedRecord | null> {
    const records = await this.getRecords();
    return records.find(r => (r as any).id === id) ?? null;
  }
};