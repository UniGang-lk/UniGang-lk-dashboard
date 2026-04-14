export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'landlord' | 'student';
  status: 'active' | 'suspended';
  profile_pic?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface University {
  id: number;
  name: string;
  location: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Annex {
  id: number;
  owner_id: number;
  university_id: number;
  title: string;
  description: string;
  price: number;
  address: string;
  campus: string;
  status: 'pending' | 'approved' | 'rejected';
  images: string[];
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: number;
  admin_id: number;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface SystemEvent {
  id: number;
  organizer_id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  price?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}
