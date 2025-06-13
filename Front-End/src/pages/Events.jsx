import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Spinner, Alert } from 'react-bootstrap';
import { FaSearch, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import { getEvents, toggleInterested } from '../services/events';
import EventCard from '../components/events/EventCard';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Events = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        setError('Errore nel caricamento degli eventi');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = (event.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.location?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || new Date(event.date).toISOString().split('T')[0] === dateFilter;

    return matchesSearch && matchesDate;
  });

  const handleInterested = async (eventId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await toggleInterested(eventId);
      setEvents(prevEvents =>
        prevEvents.map(e =>
          e.id === eventId
            ? {
                ...e,
                interestedUsers: e.interestedUsers?.includes(user.id)
                  ? e.interestedUsers.filter(id => id !== user.id)
                  : [...(e.interestedUsers || []), user.id]
              }
            : e
        )
      );
    } catch (err) {
      console.error('Errore nell\'aggiornamento dell\'interesse:', err);
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
      <h1 className="mb-4">Eventi</h1>

      <Row className="mb-4">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Cerca eventi per titolo, descrizione o location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Button
            variant="outline-primary"
            className="w-100"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter className="me-2" />
            Filtri
          </Button>
        </Col>
      </Row>

      {showFilters && (
        <Row className="mb-4">
          <Col md={4}>
            <Form.Group>
              <Form.Label>
                <FaCalendarAlt className="me-2" />
                Filtra per data
              </Form.Label>
              <Form.Control
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {filteredEvents.length === 0 ? (
        <Alert variant="info">
          Nessun evento trovato con i filtri selezionati
        </Alert>
      ) : (
        <Row>
          {filteredEvents.map(event => (
            <Col key={event._id || event.id} md={6} lg={4} className="mb-4">
              <EventCard
                event={event}
                onInterested={() => handleInterested(event.id)}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Events; 