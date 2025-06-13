import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import EventCard from '../components/events/EventCard';
import { useAuth } from '../contexts/AuthContext';
import { getInterestedEvents, toggleInterested } from '../services/events';

const MyEvents = () => {
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        setError('Devi essere autenticato per vedere i tuoi eventi.');
        return;
      }
      try {
        const data = await getInterestedEvents();
        setEvents(data);
      } catch (err) {
        setError('Errore nel caricamento dei tuoi eventi');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [isAuthenticated, user]);

  const handleInterested = async (eventId) => {
    if (!isAuthenticated || !user) return; // Già gestito sopra, ma per sicurezza

    try {
      await toggleInterested(eventId);
      // Rimuovi l'evento dalla lista se l'utente non è più interessato
      setEvents(prevEvents => prevEvents.filter(e => e._id !== eventId));
    } catch (err) {
      console.error('Errore nell\'aggiornamento dell\'interesse:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">I tuoi Eventi</h1>
      {events.length === 0 ? (
        <Alert variant="info">
          Non sei interessato a nessun evento. Esplora la sezione <a href="/events">Eventi</a>!
        </Alert>
      ) : (
        <Row>
          {events.map(event => (
            <Col key={event._id || event.id} md={6} lg={4} className="mb-4">
              <EventCard
                event={event}
                onInterested={() => handleInterested(event._id || event.id)}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MyEvents; 