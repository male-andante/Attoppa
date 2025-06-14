import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

const EventCard = ({ event, onInterested }) => {
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);

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
            await onInterested(event._id);
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
                    <Card.Title className="mb-0">{event.title}</Card.Title>
                    {event.price === 0 ? (
                        <Badge bg="success">Gratuito</Badge>
                    ) : (
                        <Badge bg="primary">{event.price}€</Badge>
                    )}
                </div>

                <Card.Subtitle className="mb-2 text-muted">
                    {formatDate(event.startDate)} - {event.startTime}
                </Card.Subtitle>

                <Card.Text className="text-truncate">
                    {event.description}
                </Card.Text>

                <div className="d-flex justify-content-between align-items-center mt-3">
                    <Link 
                        to={`/locations/${event.location._id}`}
                        className="text-decoration-none"
                    >
                        <small className="text-muted">
                            📍 {event.location.name}, {event.location.city}
                        </small>
                    </Link>

                    {isAuthenticated && (
                        <Button
                            variant={event.isInterested ? "success" : "outline-success"}
                            size="sm"
                            onClick={handleInterested}
                            disabled={loading}
                        >
                            {loading ? '...' : event.isInterested ? 'Interessato' : 'Interessato?'}
                        </Button>
                    )}
                </div>
            </Card.Body>

            <Card.Footer className="bg-transparent border-top-0">
                <Link 
                    to={`/events/${event._id}`}
                    className="btn btn-primary w-100"
                >
                    Dettagli
                </Link>
            </Card.Footer>
        </Card>
    );
};

export default EventCard; 