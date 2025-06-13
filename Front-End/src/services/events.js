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

// Ottieni tutti gli eventi (Ora include anche la logica precedentemente in getNearbyEvents)
export const getEvents = async () => {
    // Chiamiamo semplicemente l'endpoint principale che restituisce tutti gli eventi
    return fetchWithAuth('/events');
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

// Ottieni eventi a cui l'utente è interessato
export const getInterestedEvents = async () => {
    return fetchWithAuth('/events/interested');
};

// Crea nuovo evento (admin)
export const createEvent = async (eventData) => {
    // Assicurati che eventData.location sia l'ObjectId della location
    return fetchWithAuth('/events', {
        method: 'POST',
        body: JSON.stringify(eventData)
    });
};

// Aggiorna evento (admin)
export const updateEvent = async (eventId, eventData) => {
    // Assicurati che eventData.location sia l'ObjectId della location
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