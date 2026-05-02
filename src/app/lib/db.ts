
// Mystical Vault - Persistent Database Layer using LocalStorage
export interface DBUser {
  id: string;
  email: string;
  joinDate: string;
  status: 'active' | 'banned';
  role: 'user' | 'admin';
}

export interface DBReading {
  id: string;
  userId: string;
  category: string;
  timestamp: number;
}

export interface DBVisit {
  timestamp: number;
}

class MysticalVault {
  private static KEY_USERS = 'fate_users';
  private static KEY_READINGS = 'fate_readings';
  private static KEY_VISITS = 'fate_visits';

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(MysticalVault.KEY_USERS)) {
      localStorage.setItem(MysticalVault.KEY_USERS, JSON.stringify([
        { id: 'admin_1', email: 'admin@fate.io', joinDate: '2024-01-01', status: 'active', role: 'admin' },
        { id: 'u_1', email: 'mystic@star.com', joinDate: '2024-04-15', status: 'active', role: 'user' },
      ]));
    }
    if (!localStorage.getItem(MysticalVault.KEY_READINGS)) {
      // Mock some readings for the past year
      const mockReadings = [];
      const categories = ['love', 'career', 'finance', 'health', 'spiritual'];
      const now = Date.now();
      for (let i = 0; i < 500; i++) {
        mockReadings.push({
          id: Math.random().toString(36).substr(2, 9),
          userId: 'u_1',
          category: categories[Math.floor(Math.random() * categories.length)],
          timestamp: now - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
        });
      }
      localStorage.setItem(MysticalVault.KEY_READINGS, JSON.stringify(mockReadings));
    }
    if (!localStorage.getItem(MysticalVault.KEY_VISITS)) {
       const mockVisits = [];
       const now = Date.now();
       for (let i = 0; i < 1000; i++) {
         mockVisits.push({
           timestamp: now - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
         });
       }
       localStorage.setItem(MysticalVault.KEY_VISITS, JSON.stringify(mockVisits));
    }
  }

  // --- User Methods ---
  getUsers(): DBUser[] {
    return JSON.parse(localStorage.getItem(MysticalVault.KEY_USERS) || '[]');
  }

  banUser(id: string) {
    const users = this.getUsers();
    const updated = users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'banned' : 'active' } : u);
    localStorage.setItem(MysticalVault.KEY_USERS, JSON.stringify(updated));
  }

  // --- Reading Methods ---
  addReading(userId: string, category: string) {
    const readings = JSON.parse(localStorage.getItem(MysticalVault.KEY_READINGS) || '[]');
    readings.push({ id: Date.now().toString(), userId, category, timestamp: Date.now() });
    localStorage.setItem(MysticalVault.KEY_READINGS, JSON.stringify(readings));
  }

  getReadings(): DBReading[] {
    return JSON.parse(localStorage.getItem(MysticalVault.KEY_READINGS) || '[]');
  }

  // --- Visit Methods ---
  recordVisit() {
    const visits = JSON.parse(localStorage.getItem(MysticalVault.KEY_VISITS) || '[]');
    visits.push({ timestamp: Date.now() });
    localStorage.setItem(MysticalVault.KEY_VISITS, JSON.stringify(visits));
  }

  getVisits(): DBVisit[] {
    return JSON.parse(localStorage.getItem(MysticalVault.KEY_VISITS) || '[]');
  }
}

export const DB = new MysticalVault();
