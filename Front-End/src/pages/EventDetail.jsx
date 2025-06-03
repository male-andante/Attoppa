import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useAuth } from '../contexts/AuthContext';
import { getEventById, toggleInterested } from '../services/events';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaShareAlt } from 'react-icons/fa';

// Fix per l'icona del marker di Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInterested, setIsInterested] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventById(id);
        setEvent(data);
        setIsInterested(data.interestedUsers?.includes(user?.id));
      } catch (err) {
        setError('Errore nel caricamento dell\'evento');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  const handleInterested = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await toggleInterested(id);
      setIsInterested(!isInterested);
      setEvent(prev => ({
        ...prev,
        interestedUsers: isInterested
          ? prev.interestedUsers.filter(id => id !== user.id)
          : [...prev.interestedUsers, user.id]
      }));
    } catch (err) {
      setError('Errore nell\'aggiornamento dell\'interesse');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiato negli appunti!');
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

  if (!event) {
    return (
      <Container className="my-5">
        <Alert variant="warning">Evento non trovato</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title as="h1">{event.title}</Card.Title>
              <div className="d-flex gap-3 mb-3">
                <Badge bg={event.isFree ? 'success' : 'primary'}>
                  {event.isFree ? 'Gratuito' : `€${event.price}`}
                </Badge>
                <Badge bg="info">
                  <FaUsers className="me-1" />
                  {event.interestedUsers?.length || 0} interessati
                </Badge>
              </div>
              <Card.Text>{event.description}</Card.Text>
              
              <div className="d-flex gap-4 mb-4">
                <div>
                  <FaCalendarAlt className="me-2" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div>
                  <FaClock className="me-2" />
                  {event.time}
                </div>
                <div>
                  <FaMapMarkerAlt className="me-2" />
                  {event.location.name}
                </div>
              </div>

              <div className="d-flex gap-2">
                <Button
                  variant={isInterested ? 'success' : 'outline-success'}
                  onClick={handleInterested}
                  disabled={!user}
                >
                  {isInterested ? 'Interessato' : 'Interessato?'}
                </Button>
                <Button variant="outline-primary" onClick={handleShare}>
                  <FaShareAlt className="me-2" />
                  Condividi
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title>Location</Card.Title>
              <div style={{ height: '400px' }}>
                <MapContainer
                  center={[event.location.latitude, event.location.longitude]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[event.location.latitude, event.location.longitude]}>
                    <Popup>
                      <strong>{event.location.name}</strong>
                      <br />
                      {event.location.address}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Body>
              <Card.Title>Informazioni Location</Card.Title>
              <Card.Text>
                <strong>Nome:</strong> {event.location.name}
                <br />
                <strong>Indirizzo:</strong> {event.location.address}
                <br />
                <strong>Capacità:</strong> {event.location.capacity} persone
              </Card.Text>
            </Card.Body>
          </Card>

          {event.interestedUsers?.length > 0 && (
            <Card className="mt-4">
              <Card.Body>
                <Card.Title>Utenti Interessati</Card.Title>
                <div className="d-flex flex-wrap gap-2">
                  {event.interestedUsers.map(userId => (
                    <Badge key={userId} bg="secondary">
                      {userId}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EventDetail; 