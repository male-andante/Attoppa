import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { FaHeart } from 'react-icons/fa';

// Componente EventCard con icona cuore per l'interesse - VERSIONE AGGIORNATA
const EventCard = ({ event, onInterested }) => {
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);

    const eventId = event._id || event.id;
    
    // Gestione sicura per isInterested
    const isInterested = event.isInterested || false;

    const formatDate = (dateString) => {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('it-IT', options);
    };

    const handleInterested = async () => {
        if (!isAuthenticated) return;
        try {
            setLoading(true);
            await onInterested(eventId);
        } catch (err) {
            console.error('Errore durante l\'aggiornamento:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="h-100 shadow-sm">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="mb-0">{event.title || event.name || 'Evento'}</Card.Title>
                    {(event.price === 0 || event.price === undefined) ? (
                        <Badge bg="success">Gratuito</Badge>
                    ) : (
                        <Badge bg="primary">{event.price}€</Badge>
                    )}
                </div>

                <Card.Subtitle className="mb-2 text-muted">
                    {event.startDate ? formatDate(event.startDate) : 'Data non disponibile'} - {event.startTime || 'Orario non disponibile'}
                </Card.Subtitle>

                <Card.Text className="text-truncate">
                    {event.description || 'Nessuna descrizione disponibile'}
                </Card.Text>

                <div className="d-flex justify-content-between align-items-center mt-3">
                    {event.location && event.location._id ? (
                        <Link 
                            to={`/locations/${event.location._id || event.location.id}`}
                            className="text-decoration-none"
                        >
                            <small className="text-muted">
                                📍 {event.location.name || 'Location'}, {event.location.city || 'Città'}
                            </small>
                        </Link>
                    ) : event.location ? (
                        <small className="text-muted">
                            📍 {event.location.name || 'Location'}
                        </small>
                    ) : (
                        <small className="text-muted">
                            📍 Location non specificata
                        </small>
                    )}

                    {isAuthenticated && (
                        <Button
                            variant="link"
                            size="sm"
                            onClick={handleInterested}
                            disabled={loading}
                            className="p-0 border-0"
                            style={{ color: '#dc3545' }}
                        >
                            <FaHeart 
                                size={20} 
                                fill={isInterested ? '#dc3545' : 'none'} 
                                stroke="#dc3545"
                                strokeWidth={2}
                            />
                        </Button>
                    )}
                </div>
            </Card.Body>

            <Card.Footer className="bg-transparent border-top-0">
                <Link 
                    to={`/events/${eventId}`}
                    className="btn btn-primary w-100"
                >
                    Dettagli
                </Link>
            </Card.Footer>
        </Card>
    );
};

export default EventCard; 