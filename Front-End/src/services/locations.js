import { API_URL } from './config';

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${url}`, { ...options, headers });
    if (!response.ok) {
      throw new Error('Errore nella richiesta');
    }
    return await response.json();
  } catch (error) {
    console.error('Errore nella chiamata API:', error);
    throw error;
  }
};

export const getLocations = async () => {
  return fetchWithAuth('/locations');
};

export const getLocationById = async (id) => {
  return fetchWithAuth(`/locations/${id}`);
};

export const getLocationEvents = async (id) => {
  return fetchWithAuth(`/locations/${id}/events`);
};

// Funzioni admin
export const createLocation = async (locationData) => {
  return fetchWithAuth('/locations', {
    method: 'POST',
    body: JSON.stringify(locationData),
  });
};

export const updateLocation = async (id, locationData) => {
  return fetchWithAuth(`/locations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(locationData),
  });
};

export const deleteLocation = async (id) => {
  return fetchWithAuth(`/locations/${id}`, {
    method: 'DELETE',
  });
}; 