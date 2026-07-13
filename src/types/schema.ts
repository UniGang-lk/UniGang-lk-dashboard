export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'landlord' | 'student';
  status: 'active' | 'suspended';
  profile_pic?: string;
  phone?: string;
  is_verified_student?: boolean;
  is_verified_landlord?: boolean;
  verification_id_url?: string | null;
  campus_email?: string | null;
  campus_email_verification_code?: string | null;
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
  price: string | number;
  address: string;
  campus: string;
  status: string;
  images: string[];
  features: string[];
  listing_type?: 'LANDLORD_RENT' | 'ROOMMATE_WANTED';
  securityDeposit?: string;
  proximityHub?: string;
  googleMapsUrl?: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  postedDate?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnnexReview {
  id: string;
  overallRating: number;
  cleanlinessRating: number;
  landlordRating: number;
  comment?: string;
  isApproved: boolean;
  annexId: string;
  userId: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  annex?: {
    id: string;
    title: string;
  };
  user?: {
    name: string;
    email: string;
  };
}

export interface Announcement {
  id: number;
  admin_id: number;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  imageUrl?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemEvent {
  id: number | string;
  organizer_id?: number | string;
  title: string;
  description: string;
  date: string;
  location: string;
  price?: number | string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'pending' | 'approved' | 'rejected';
  image?: string;
  phone?: string;
  contact?: string;
  extra?: string;
  university?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceRequest {
  id: string;
  serviceName: string;
  clientPhone: string;
  clientEmail?: string;
  brief: string;
  deadline?: string;
  budget?: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  adminNotes?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    profile_pic?: string;
    phone?: string;
  };
}

export interface Blog {
  id: number | string;
  title: string;
  category: string;
  author: string;
  authorImage?: string;
  excerpt: string;
  content: string;
  tags: string;
  image: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
