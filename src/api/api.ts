import type { User, Annex, University, Announcement, SystemEvent, Blog } from '../types/schema';
import { auth } from '../firebase';
import universitiesData from '../constants/annex/Universities.json';

// Helper to retrieve active Firebase ID token, with fallback to cached localStorage token
const getToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) {
    return localStorage.getItem('userToken');
  }
  try {
    const token = await user.getIdToken();
    localStorage.setItem('userToken', token);
    return token;
  } catch (error) {
    console.error('Error refreshing Firebase ID token:', error);
    return localStorage.getItem('userToken');
  }
};

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

export const fetchStats = async (): Promise<{ totalStudents: number; approvedAnnexes: number; pendingAnnexes: number }> => {
  const users = getStorage<User>(STORAGE_KEYS.USERS);
  const annexes = getStorage<Annex>(STORAGE_KEYS.ANNEXES);
  return new Promise<{ totalStudents: number; approvedAnnexes: number; pendingAnnexes: number }>((resolve) => {
    setTimeout(() => resolve({
      totalStudents: users.filter(u => u.role === 'student').length,
      approvedAnnexes: annexes.filter(a => a.status === 'approved').length,
      pendingAnnexes: annexes.filter(a => a.status === 'pending').length,
    }), 300);
  });
};

export const fetchAnnexes = async (): Promise<any[]> => {
  const token = await getToken();
  const response = await fetch('http://localhost:5000/api/annexes/admin', {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to fetch admin listings');
  const data = await response.json();
  return data.map((item: any) => ({
    ...item,
    price: `Rs. ${parseFloat(item.price).toLocaleString()}/month`,
    campus: item.university ? item.university.name : 'Unknown',
    contactName: item.owner ? item.owner.name : 'Owner',
    contactPhone: item.owner ? item.owner.phone : '',
    postedDate: new Date(item.createdAt).toLocaleDateString(),
    features: item.features ? item.features.map((f: any) => f.featureName) : [],
    images: item.images ? item.images.map((img: any) => `http://localhost:5000${img.imageUrl}`) : []
  }));
};

export const updateAnnexStatus = async (id: number | string, status: string): Promise<void> => {
  const token = await getToken();
  const normalizedStatus = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : status;
  const response = await fetch(`http://localhost:5000/api/annexes/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ status: normalizedStatus })
  });
  if (!response.ok) throw new Error('Failed to update status');
};

export const fetchPendingReviews = async (): Promise<any[]> => {
  const token = await getToken();
  const response = await fetch('http://localhost:5000/api/annexes/reviews/pending', {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to fetch pending reviews');
  return await response.json();
};

export const approveReview = async (reviewId: number | string): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`http://localhost:5000/api/annexes/reviews/${reviewId}/approve`, {
    method: 'PUT',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to approve review');
};

export const deleteReview = async (reviewId: number | string): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`http://localhost:5000/api/annexes/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to delete review');
};


export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getStorage<Announcement>(STORAGE_KEYS.ANNOUNCEMENTS)), 300);
  });
};

export const fetchEvents = async (): Promise<SystemEvent[]> => {
  const token = await getToken();
  const response = await fetch('http://localhost:5000/api/events/admin/all', {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to fetch admin events');
  const result = await response.json();
  return result.data || [];
};

export const updateEventStatus = async (id: number | string, status: string): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`http://localhost:5000/api/events/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update event status');
};

export const deleteEvent = async (id: number | string): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`http://localhost:5000/api/events/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to delete event');
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

export const updateAnnex = async (id: number | string, adData: any): Promise<any> => {
  const token = await getToken();
  const formData = new FormData();
  formData.append('title', adData.title);
  formData.append('description', adData.description);
  formData.append('price', adData.price);
  formData.append('address', adData.address);
  
  // Resolve university ID
  const uni = universitiesData.find((u: any) => u.name === adData.selectedCampus);
  if (uni) {
    formData.append('universityId', uni.id);
  } else {
    formData.append('universityId', '0');
  }

  formData.append('features', JSON.stringify(adData.features));

  if (adData.newImages && adData.newImages.length > 0) {
    adData.newImages.forEach((file: File) => {
      formData.append('images', file);
    });
  }

  const response = await fetch(`http://localhost:5000/api/annexes/${id}`, {
    method: 'PUT',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to update annex advertisement');
  }

  return await response.json();
};

export const deleteAnnex = async (id: number | string): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`http://localhost:5000/api/annexes/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to delete annex advertisement');
  }
};

// ─── SERVICE REQUESTS ────────────────────────────────────────────────────────

// @desc  Fetch all service requests (optionally filtered by status)
export const fetchServiceRequests = async (status?: string): Promise<any[]> => {
  const token = await getToken();
  const query = status && status !== 'all' ? `?status=${status}` : '';
  const response = await fetch(`http://localhost:5000/api/services${query}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to fetch service requests');
  const data = await response.json();
  return data.data ?? [];
};

// @desc  Fetch a single service request by ID
export const fetchServiceRequestById = async (id: string): Promise<any> => {
  const token = await getToken();
  const response = await fetch(`http://localhost:5000/api/services/${id}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Service request not found');
  const data = await response.json();
  return data.data;
};

// @desc  Update the status (and optional admin notes) of a service request
export const updateServiceRequestStatus = async (
  id: string,
  status: string,
  adminNotes?: string
): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`http://localhost:5000/api/services/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ status, ...(adminNotes !== undefined ? { adminNotes } : {}) })
  });
  if (!response.ok) throw new Error('Failed to update service request status');
};

// @desc  Delete a service request
export const deleteServiceRequest = async (id: string): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`http://localhost:5000/api/services/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to delete service request');
};

// @desc  Fetch messages for a service request
export const fetchServiceMessages = async (id: string): Promise<any[]> => {
  const token = await getToken();
  const response = await fetch(`http://localhost:5000/api/services/${id}/messages`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to fetch service messages');
  const data = await response.json();
  return data.data ?? [];
};

// @desc  Add a message to a service request
export const addServiceMessage = async (id: string, message: string): Promise<any> => {
  const token = await getToken();
  const response = await fetch(`http://localhost:5000/api/services/${id}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ message })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to add service message');
  }
  const data = await response.json();
  return data.data;
};

// ─── BLOGS CONSOLE ENDPOINTS ────────────────────────────────────────

export const fetchBlogs = async (): Promise<Blog[]> => {
  const token = await getToken();
  const response = await fetch('http://localhost:5000/api/blogs/admin/all', {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to fetch admin blogs');
  const data = await response.json();
  return data.map((blog: any) => ({
    id: blog.id,
    title: blog.title,
    category: blog.category,
    author: blog.author ? blog.author.name : 'Unknown',
    authorImage: blog.author && blog.author.profile_pic
      ? (blog.author.profile_pic.startsWith('http') || blog.author.profile_pic.startsWith('data:image') ? blog.author.profile_pic : `http://localhost:5000${blog.author.profile_pic}`)
      : undefined,
    excerpt: blog.excerpt,
    content: blog.content,
    tags: blog.tags || '',
    image: blog.featuredImage 
      ? (blog.featuredImage.startsWith('http') ? blog.featuredImage : `http://localhost:5000${blog.featuredImage}`)
      : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800',
    status: blog.status.toLowerCase() as 'pending' | 'approved' | 'rejected',
    createdAt: blog.createdAt
  }));
};

export const updateBlogStatus = async (id: number | string, status: string): Promise<void> => {
  const token = await getToken();
  const normalizedStatus = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending';
  const response = await fetch(`http://localhost:5000/api/blogs/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ status: normalizedStatus })
  });
  if (!response.ok) throw new Error('Failed to update blog status');
};

export const deleteBlog = async (id: number | string): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`http://localhost:5000/api/blogs/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to delete blog');
};

// ─── NOTIFICATIONS API ────────────────────────────────────────

export const fetchMyNotifications = async (): Promise<any[]> => {
  const token = await getToken();
  const response = await fetch(`http://localhost:5000/api/notifications`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to fetch notifications');
  const data = await response.json();
  return data.notifications ?? [];
};

export const markNotificationAsRead = async (id: string): Promise<any> => {
  const token = await getToken();
  const response = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
    method: 'PATCH',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to mark notification as read');
  return response.json();
};

export const markAllNotificationsAsRead = async (): Promise<any> => {
  const token = await getToken();
  const response = await fetch(`http://localhost:5000/api/notifications/read-all`, {
    method: 'PATCH',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to mark all as read');
  return response.json();
};

