import { API_URL } from './config';

// Funzione helper per le chiamate API
const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Errore nella richiesta');
    }

    return response.json();
};

// Ottieni tutti gli eventi
export const getEvents = async () => {
    return fetchWithAuth('/events');
};

// Ottieni eventi vicini
export const getNearbyEvents = async (latitude, longitude, radius = 50) => {
    return fetchWithAuth(`/events/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
};

// Ottieni dettagli evento
export const getEventById = async (id) => {
    return fetchWithAuth(`/events/${id}`);
};

// Marca evento come interessato/non interessato
export const toggleInterested = async (eventId) => {
    return fetchWithAuth(`/events/${eventId}/interested`, {
        method: 'POST'
    });
};

// Ottieni eventi preferiti dell'utente
export const getFavoriteEvents = async () => {
    return fetchWithAuth('/events/favorites');
};

// Crea nuovo evento (admin)
export const createEvent = async (eventData) => {
    return fetchWithAuth('/events', {
        method: 'POST',
        body: JSON.stringify(eventData)
    });
};

// Aggiorna evento (admin)
export const updateEvent = async (eventId, eventData) => {
    return fetchWithAuth(`/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify(eventData)
    });
};

// Elimina evento (admin)
export const deleteEvent = async (eventId) => {
    return fetchWithAuth(`/events/${eventId}`, {
        method: 'DELETE'
    });
}; 