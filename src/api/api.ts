const API_URL = 'http://localhost:5000/api';

export const fetchUsers = async (token: string) => {
  const response = await fetch(`${API_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const deleteUser = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete user');
  return response.json();
};

export const fetchStats = async (token: string) => {
  const response = await fetch(`${API_URL}/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
};

export const fetchAnnexes = async (token: string) => {
  const response = await fetch(`${API_URL}/annexes/admin`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch annexes');
  return response.json();
};

export const updateAnnexStatus = async (id: string, status: string, token: string) => {
  const response = await fetch(`${API_URL}/annexes/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update annex status');
  return response.json();
};

export const fetchAnnouncements = async (token: string) => {
  const response = await fetch(`${API_URL}/announcements`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch announcements');
  return response.json();
};

export const createAnnouncement = async (data: object, token: string) => {
  const response = await fetch(`${API_URL}/announcements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create announcement');
  return response.json();
};

export const updateAnnouncement = async (id: string, data: object, token: string) => {
  const response = await fetch(`${API_URL}/announcements/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update announcement');
  return response.json();
};

export const deleteAnnouncement = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/announcements/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to delete announcement');
  return response.json();
};

