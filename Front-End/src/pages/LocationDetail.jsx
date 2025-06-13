import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import { getLocationById, getLocationEvents } from '../services/locations';
import 'leaflet/dist/leaflet.css';

const LocationDetail = () => {
  const { id } = useParams();
  const [location, setLocation] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationData, eventsData] = await Promise.all([
          getLocationById(id),
          getLocationEvents(id)
        ]);
        setLocation(locationData);
        setEvents(eventsData);
      } catch (err) {
        setError('Errore nel caricamento dei dati della location');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  if (!location) {
    return (
      <Container className="my-5">
        <Alert variant="warning">Location non trovata</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title as="h1">{location.name}</Card.Title>
              <Card.Text className="mb-4">
                <FaMapMarkerAlt className="me-2" />
                {location.address}
                <br />
                <FaUsers className="me-2" />
                Capacità: {location.capacity} persone
              </Card.Text>

              <div style={{ height: '400px' }} className="mb-4">
                {location.latitude && location.longitude ? (
                  <MapContainer
                    center={[location.latitude, location.longitude]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[location.latitude, location.longitude]}>
                      <Popup>
                        <strong>{location.name}</strong>
                        <br />
                        {location.address}
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <Alert variant="warning" className="text-center">
                    Coordinate mappa non disponibili per questa location.
                  </Alert>
                )}
              </div>

              {location.description && (
                <Card.Text>{location.description}</Card.Text>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title>Eventi in questa location</Card.Title>
              {events.length > 0 ? (
                <ListGroup variant="flush">
                  {events.map(event => (
                    <ListGroup.Item key={event._id || event.id}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1">
                            <Link to={`/events/${event.id}`} className="text-decoration-none">
                              {event.title}
                            </Link>
                          </h5>
                          <div className="text-muted">
                            <FaCalendarAlt className="me-2" />
                            {new Date(event.startDate).toLocaleDateString()} - {event.startTime}
                          </div>
                        </div>
                        <Button
                          as={Link}
                          to={`/events/${event.id}`}
                          variant="outline-primary"
                          size="sm"
                        >
                          Dettagli
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <Alert variant="info">
                  Nessun evento programmato in questa location
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Body>
              <Card.Title>Informazioni</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Nome:</strong> {location.name}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Indirizzo:</strong> {location.address}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Capacità:</strong> {location.capacity} persone
                </ListGroup.Item>
                {location.contactInfo && (
                  <ListGroup.Item>
                    <strong>Contatti:</strong>
                    <br />
                    {location.contactInfo}
                  </ListGroup.Item>
                )}
                {location.openingHours && (
                  <ListGroup.Item>
                    <strong>Orari di apertura:</strong>
                    <br />
                    {location.openingHours}
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Body>
              <Card.Title>Come raggiungerci</Card.Title>
              <Card.Text>
                <strong>Coordinate:</strong>
                <br />
                Latitudine: {location.latitude}
                <br />
                Longitudine: {location.longitude}
              </Card.Text>
              <Button
                variant="outline-primary"
                href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Apri in Google Maps
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LocationDetail; 