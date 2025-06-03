import { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import EventCard from '../components/events/EventCard';
import { getNearbyEvents, getEvents, toggleInterested } from '../services/events';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState(null);

    // Ottieni la posizione dell'utente
    useEffect(() => {
        const getLocation = () => {
            if (!navigator.geolocation) {
                setError('La geolocalizzazione non è supportata dal tuo browser');
                setLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Errore nella geolocalizzazione:', error);
                    setError('Impossibile ottenere la tua posizione. Verranno mostrati tutti gli eventi.');
                    setLoading(false);
                }
            );
        };

        getLocation();
    }, []);

    // Carica gli eventi quando abbiamo la posizione
    useEffect(() => {
        const loadEvents = async () => {
            try {
                setLoading(true);
                let data;
                
                if (location) {
                    data = await getNearbyEvents(
                        location.latitude,
                        location.longitude
                    );
                } else {
                    data = await getEvents();
                }

                setEvents(data);
            } catch (err) {
                console.error('Errore nel caricamento degli eventi:', err);
                setError('Errore nel caricamento degli eventi');
            } finally {
                setLoading(false);
            }
        };

        if (location || error) {
            loadEvents();
        }
    }, [location, error]);

    const handleInterested = async (eventId) => {
        try {
            const updatedEvent = await toggleInterested(eventId);
            setEvents(events.map(event => 
                event._id === eventId 
                    ? { ...event, isInterested: updatedEvent.isInterested }
                    : event
            ));
        } catch (err) {
            console.error('Errore nell\'aggiornamento:', err);
        }
    };

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert variant="warning">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container>
            <h1 className="mb-4">
                {location 
                    ? 'Eventi vicini a te'
                    : 'Tutti gli eventi'
                }
            </h1>

            {events.length === 0 ? (
                <Alert variant="info">
                    Nessun evento trovato nelle vicinanze
                </Alert>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {events.map(event => (
                        <Col key={event._id}>
                            <EventCard 
                                event={event}
                                onInterested={handleInterested}
                            />
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default Home; 