import type { User, Annex, University, Announcement, SystemEvent } from '../types/schema';

// --- MOCK STORAGE SERVICE ---

export const STORAGE_KEYS = {
  USERS: 'uni_gang_users',
  ANNEXES: 'uni_gang_annexes',
  UNIVERSITIES: 'uni_gang_universities',
  ANNOUNCEMENTS: 'uni_gang_announcements',
  EVENTS: 'uni_gang_events',
  SERVICES: 'uni_gang_services',
  BLOGS: 'uni_gang_blogs',
  FEEDBACK: 'uni_gang_feedback',
  PROBLEMS: 'uni_gang_problems'
};

const getStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- INITIAL SEED DATA ---

const seedData = () => {
  if (getStorage(STORAGE_KEYS.USERS).length === 0) {
    const users: User[] = [
      { id: 1, name: 'Admin Kaja', email: 'admin@unigung.lk', role: 'admin', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 2, name: 'John Landlord', email: 'john@example.com', role: 'landlord', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 3, name: 'Saman Perera', email: 'saman@student.lk', role: 'student', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
    setStorage(STORAGE_KEYS.USERS, users);

    const universities: University[] = [
      { id: 1, name: 'University of Moratuwa', location: 'Katubedda', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 2, name: 'SLIIT', location: 'Malabe', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
    setStorage(STORAGE_KEYS.UNIVERSITIES, universities);

    const annexes: Annex[] = [
      { 
        id: 1, owner_id: 2, university_id: 1, title: 'Luxury Studio - Moratuwa', status: 'Pending', price: '25,000', 
        address: 'No 45, Bandaranayake Mawatha', campus: 'UOM', description: 'Prime location near UOM',
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800'], 
        features: ['WiFi', 'Kitchen'], contactName: 'John Landlord', contactPhone: '+94 77 123 4567',
        securityDeposit: '50,000', proximityHub: '100m to UOM Main Gate', googleMapsUrl: 'https://maps.google.com'
      },
    ];
    setStorage(STORAGE_KEYS.ANNEXES, annexes);

    const events: SystemEvent[] = [
      {
        id: 1, title: 'UOM Career Fair 2024', description: 'Annual career fair for engineering students.',
        date: '2024-11-10', location: 'Civil Auditorium', status: 'upcoming', price: 'Free',
        image: 'https://images.unsplash.com/photo-1540575861501-7ad0582373f3?q=80&w=800',
        phone: '+94 11 265 0301', extra: 'Bring your printed CVs.'
      }
    ];
    setStorage(STORAGE_KEYS.EVENTS, events);
  }
};

seedData();

// --- API EXPORTS ---

export const fetchUsers = async (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getStorage<User>(STORAGE_KEYS.USERS)), 300);
  });
};

export const deleteUser = async (id: number): Promise<void> => {
  return new Promise((resolve) => {
    const users = getStorage<User>(STORAGE_KEYS.USERS);
    setStorage(STORAGE_KEYS.USERS, users.filter(u => u.id !== id));
    setTimeout(resolve, 300);
  });
};

export const fetchStats = async () => {
  const users = getStorage<User>(STORAGE_KEYS.USERS);
  const annexes = getStorage<Annex>(STORAGE_KEYS.ANNEXES);
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      totalStudents: users.filter(u => u.role === 'student').length,
      approvedAnnexes: annexes.filter(a => a.status === 'approved').length,
      pendingAnnexes: annexes.filter(a => a.status === 'pending').length,
    }), 300);
  });
};

export const fetchAnnexes = async (): Promise<Annex[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getStorage<Annex>(STORAGE_KEYS.ANNEXES)), 300);
  });
};

export const updateAnnexStatus = async (id: number, status: Annex['status']): Promise<void> => {
  return new Promise((resolve) => {
    const annexes = getStorage<Annex>(STORAGE_KEYS.ANNEXES);
    const updated = annexes.map(a => a.id === id ? { ...a, status, updated_at: new Date().toISOString() } : a);
    setStorage(STORAGE_KEYS.ANNEXES, updated);
    setTimeout(resolve, 300);
  });
};

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getStorage<Announcement>(STORAGE_KEYS.ANNOUNCEMENTS)), 300);
  });
};

export const fetchEvents = async (): Promise<SystemEvent[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getStorage<SystemEvent>(STORAGE_KEYS.EVENTS)), 300);
  });
};

export const deleteEntity = async (key: string, id: number): Promise<void> => {
  return new Promise((resolve) => {
    const items = getStorage<any>(key);
    setStorage(key, items.filter((item: any) => item.id !== id));
    setTimeout(resolve, 300);
  });
};

export const updateEntity = async <T extends { id: number }>(key: string, id: number, data: Partial<T>): Promise<void> => {
  return new Promise((resolve) => {
    const items = getStorage<T>(key);
    const updated = items.map(item => item.id === id ? { ...item, ...data, updated_at: new Date().toISOString() } : item);
    setStorage(key, updated);
    setTimeout(resolve, 300);
  });
};
