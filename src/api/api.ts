import type { Announcement, SystemEvent, Blog } from '../types/schema';
import { auth } from '../firebase';
import universitiesData from '../constants/annex/Universities.json';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

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

// --- API EXPORTS ---

export const fetchUsers = async (): Promise<any[]> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/admin/users`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  const data = await response.json();
  return data;
};

export const verifyUser = async (id: number | string): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/admin/users/${id}/verify`, {
    method: 'PUT',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  });
  if (!response.ok) throw new Error('Failed to verify user');
};

export const deleteUser = async (id: number | string): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  });
  if (!response.ok) throw new Error('Failed to delete user');
};

export const fetchStats = async (): Promise<{ totalStudents: number; approvedAnnexes: number; pendingAnnexes: number }> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/stats`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
};

export const fetchAnnexes = async (): Promise<any[]> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/annexes/admin`, {
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
    images: item.images ? item.images.map((img: any) => `${BASE_URL}${img.imageUrl}`) : []
  }));
};

export const updateAnnexStatus = async (id: number | string, status: string): Promise<void> => {
  const token = await getToken();
  const normalizedStatus = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : status;
  const response = await fetch(`${BASE_URL}/api/annexes/${id}/status`, {
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
  const response = await fetch(`${BASE_URL}/api/annexes/reviews/pending`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to fetch pending reviews');
  return await response.json();
};

export const approveReview = async (reviewId: number | string): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/annexes/reviews/${reviewId}/approve`, {
    method: 'PUT',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to approve review');
};

export const deleteReview = async (reviewId: number | string): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/annexes/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to delete review');
};


export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const response = await fetch(`${BASE_URL}/api/announcements`);
  if (!response.ok) throw new Error('Failed to fetch announcements');
  return response.json();
};

export const createAnnouncement = async (title: string, content: string): Promise<Announcement> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/announcements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ title, content })
  });
  if (!response.ok) throw new Error('Failed to create announcement');
  return response.json();
};

export const updateAnnouncement = async (id: number | string, title: string, content: string): Promise<Announcement> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/announcements/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ title, content })
  });
  if (!response.ok) throw new Error('Failed to update announcement');
  return response.json();
};

export const deleteAnnouncement = async (id: number | string): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/announcements/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to delete announcement');
};

export const fetchEvents = async (): Promise<SystemEvent[]> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/events/admin/all`, {
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
  const response = await fetch(`${BASE_URL}/api/events/${id}/status`, {
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
  const response = await fetch(`${BASE_URL}/api/events/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to delete event');
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

  const response = await fetch(`${BASE_URL}/api/annexes/${id}`, {
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
  const response = await fetch(`${BASE_URL}/api/annexes/${id}`, {
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
  const response = await fetch(`${BASE_URL}/api/services${query}`, {
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
  const response = await fetch(`${BASE_URL}/api/services/${id}`, {
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
  const response = await fetch(`${BASE_URL}/api/services/${id}/status`, {
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
  const response = await fetch(`${BASE_URL}/api/services/${id}`, {
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
  const response = await fetch(`${BASE_URL}/api/services/${id}/messages`, {
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
  const response = await fetch(`${BASE_URL}/api/services/${id}/messages`, {
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
  const response = await fetch(`${BASE_URL}/api/blogs/admin/all`, {
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
      ? (blog.author.profile_pic.startsWith('http') || blog.author.profile_pic.startsWith('data:image') ? blog.author.profile_pic : `${BASE_URL}${blog.author.profile_pic}`)
      : undefined,
    excerpt: blog.excerpt,
    content: blog.content,
    tags: blog.tags || '',
    image: blog.featuredImage 
      ? (blog.featuredImage.startsWith('http') ? blog.featuredImage : `${BASE_URL}${blog.featuredImage}`)
      : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800',
    status: blog.status.toLowerCase() as 'pending' | 'approved' | 'rejected',
    createdAt: blog.createdAt
  }));
};

export const updateBlogStatus = async (id: number | string, status: string): Promise<void> => {
  const token = await getToken();
  const normalizedStatus = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending';
  const response = await fetch(`${BASE_URL}/api/blogs/${id}/status`, {
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
  const response = await fetch(`${BASE_URL}/api/blogs/${id}`, {
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
  const response = await fetch(`${BASE_URL}/api/notifications`, {
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
  const response = await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
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
  const response = await fetch(`${BASE_URL}/api/notifications/read-all`, {
    method: 'PATCH',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to mark all as read');
  return response.json();
};

// ─── ADVERTISEMENTS API ────────────────────────────────────────

export const fetchAdvertisements = async (): Promise<any[]> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/advertisements`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to fetch advertisements');
  const data = await response.json();
  return data.data ?? [];
};

export const updateAdvertisementStatus = async (id: string | number, status: string): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/advertisements/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update advertisement status');
};

export const updateAdvertisement = async (id: string | number, data: any): Promise<any> => {
  const token = await getToken();
  const formData = new FormData();
  
  if (data.company_name) formData.append('company_name', data.company_name);
  if (data.contact_email) formData.append('contact_email', data.contact_email);
  if (data.contact_phone) formData.append('contact_phone', data.contact_phone);
  if (data.ad_title) formData.append('ad_title', data.ad_title);
  if (data.ad_description) formData.append('ad_description', data.ad_description);
  if (data.target_link) formData.append('target_link', data.target_link);
  if (data.placement_type) formData.append('placement_type', data.placement_type);
  if (data.duration_days) formData.append('duration_days', data.duration_days);

  if (data.image) {
    formData.append('image', data.image);
  }

  const response = await fetch(`${BASE_URL}/api/advertisements/${id}`, {
    method: 'PUT',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to update advertisement');
  }

  const result = await response.json();
  return result.data;
};

// ─── MARKETPLACE ADMIN API ────────────────────────────────────────

export const fetchAdminMarketItems = async (): Promise<any[]> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/admin/market`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to fetch admin marketplace items');
  return await response.json();
};

export const updateMarketItemStatus = async (id: string | number, status: string): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/admin/market/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update marketplace listing status');
};

export const deleteMarketItem = async (id: string | number): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/admin/market/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to delete marketplace listing');
};

export const updateUserProfile = async (id: number | string, data: any): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update user profile');
};

export const createMarketItem = async (itemData: any): Promise<any> => {
  const token = await getToken();
  const formData = new FormData();
  formData.append('title', itemData.title);
  formData.append('type', itemData.type);
  formData.append('price', itemData.price);
  if (itemData.condition) {
    formData.append('condition', itemData.condition);
  }
  formData.append('description', itemData.description);

  if (itemData.images && itemData.images.length > 0) {
    itemData.images.forEach((file: File) => {
      formData.append('images', file);
    });
  }

  const response = await fetch(`${BASE_URL}/api/market`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData
  });

  if (!response.ok) {
    try {
      const err = await response.json();
      throw new Error(err.message || `Server error (${response.status})`);
    } catch {
      throw new Error(`Failed to create marketplace item (HTTP ${response.status})`);
    }
  }

  return await response.json();
};

export const fetchAdminOrders = async (): Promise<any[]> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/market/orders/admin`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to fetch admin orders');
  return await response.json();
};

export const updateOrderStatus = async (orderId: string | number, status: string): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/market/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update order status');
};

export const updateMarketItem = async (itemId: string | number, itemData: any): Promise<any> => {
  const token = await getToken();
  const formData = new FormData();
  if (itemData.title !== undefined) formData.append('title', itemData.title);
  if (itemData.price !== undefined) formData.append('price', itemData.price);
  if (itemData.description !== undefined) formData.append('description', itemData.description);
  if (itemData.status !== undefined) formData.append('status', itemData.status);
  if (itemData.condition !== undefined) formData.append('condition', itemData.condition);

  if (itemData.images && itemData.images.length > 0) {
    itemData.images.forEach((file: File) => {
      formData.append('images', file);
    });
  }

  const response = await fetch(`${BASE_URL}/api/admin/market/${itemId}`, {
    method: 'PUT',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData
  });

  if (!response.ok) {
    try {
      const err = await response.json();
      throw new Error(err.message || `Server error (${response.status})`);
    } catch {
      throw new Error(`Failed to update marketplace item (HTTP ${response.status}). Make sure you are logged in as admin.`);
    }
  }

  return await response.json();
};

export const fetchAdminChats = async (): Promise<any[]> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/admin/chats`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to fetch active chats');
  return await response.json();
};

export const fetchAdminChatMessages = async (chatId: string): Promise<any> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/admin/chats/${chatId}/messages`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to fetch chat messages');
  return await response.json();
};

// --- SUPPORT & FEEDBACK ADMIN API ---

export const fetchAdminFeedbacks = async (): Promise<any[]> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/support/admin/feedbacks`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to fetch admin feedbacks');
  const data = await response.json();
  return data.feedbacks || [];
};

export const updateAdminFeedback = async (id: string | number, feedbackData: any): Promise<any> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/support/admin/feedbacks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(feedbackData)
  });
  if (!response.ok) throw new Error('Failed to update feedback');
  return await response.json();
};

export const deleteAdminFeedback = async (id: string | number): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/support/admin/feedbacks/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to delete feedback');
};

export const fetchAdminProblems = async (): Promise<any[]> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/support/admin/problems`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to fetch support tickets');
  const data = await response.json();
  return data.problems || [];
};

export const replyToAdminProblem = async (id: string | number, adminReply: string): Promise<any> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/support/admin/problems/${id}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ adminReply })
  });
  if (!response.ok) throw new Error('Failed to submit reply to support ticket');
  return await response.json();
};

export const deleteAdminProblem = async (id: string | number): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}/api/support/admin/problems/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to delete support ticket');
};




