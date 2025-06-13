import { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import EventCard from '../components/events/EventCard';
import { getEvents, toggleInterested } from '../services/events';
import './Home.css'; // Importo lo stile custom

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Carica tutti gli eventi all'avvio del componente
    useEffect(() => {
        const loadEvents = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Chiamo sempre getEvents per recuperare tutti gli eventi
                const data = await getEvents();
                
                setEvents(data);
            } catch (err) {
                console.error('Errore nel caricamento degli eventi:', err);
                setError('Errore nel caricamento degli eventi.');
            } finally {
                setLoading(false);
            }
        };

        loadEvents(); // Eseguo la funzione di caricamento all'avvio
    }, []); // Dipendenze vuote: eseguo solo una volta al mount

    const handleInterested = async (eventId) => {
        try {
            const updatedEvent = await toggleInterested(eventId);
            setEvents(events.map(event => 
                event._id === eventId 
                    ? { ...event, isInterested: updatedEvent.isInterested }
                    : event
            ));
        } catch (err) {
            console.error('Errore nell\'aggiornamento dell\'interesse:', err);
            // Potresti voler mostrare un messaggio all'utente qui
        }
    };

    if (loading) {
        return (
            <Container className="text-center py-5 home-responsive-container">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="home-responsive-container">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="home-responsive-container">
            <h1 className="mb-4">Tutti gli eventi</h1>

            {events.length === 0 ? (
                <Alert variant="info">
                    Nessun evento trovato.
                </Alert>
            ) : (
                <Row className="g-4">
                    {events.map(event => (
                        <Col key={event._id} xs={12} lg={3}>
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