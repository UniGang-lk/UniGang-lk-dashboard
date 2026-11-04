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
  id: string | number;
  owner_id?: string | number;
  university_id?: string | number;
  title: string;
  description: string;
  price: string | number;
  address: string;
  campus: string;
  status: string;
  images: string[];
  features: string[];
  listing_type?: 'LANDLORD_RENT' | 'ROOMMATE_WANTED';
  listingType?: string;
  landlordPresence?: string;
  landlord_presence?: string;
  beds?: number;
  bath?: string;
  key_money_months?: number;
  keyMoneyMonths?: number;
  securityDeposit?: string;
  genderPolicy?: string;
  gender_policy?: string;
  curfewTime?: string;
  curfew_time?: string;
  visitorPolicy?: string;
  visitor_policy?: string;
  busRoute?: string;
  bus_route?: string;
  walkTimeMins?: number;
  walk_time_mins?: number;
  distanceToUni?: number;
  distance_to_uni?: number;
  hasPowerBackup?: boolean;
  has_power_backup?: boolean;
  hasWaterTank?: boolean;
  has_water_tank?: boolean;
  isCookingAllowed?: boolean;
  is_cooking_allowed?: boolean;
  hasSeparateEntrance?: boolean;
  has_separate_entrance?: boolean;
  hasSeparateMeter?: boolean;
  has_separate_meter?: boolean;
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
  userId?: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  category?: string;
  price?: number | string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'pending' | 'approved' | 'rejected' | string;
  image?: string;
  phone?: string;
  contact?: string;
  requirements?: string;
  extra?: string;
  uni?: string;
  university?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
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
  createdAt?: string;
  updatedAt?: string;
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
