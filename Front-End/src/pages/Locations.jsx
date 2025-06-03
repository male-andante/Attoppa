import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getLocations } from '../services/locations';
import 'leaflet/dist/leaflet.css';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getLocations();
        setLocations(data);
      } catch (err) {
        setError('Errore nel caricamento delle location');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title as="h1">Location</Card.Title>
              <InputGroup className="mb-4">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Cerca per nome o indirizzo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              <div className="locations-grid">
                {filteredLocations.map(location => (
                  <Card key={location.id} className="mb-3">
                    <Card.Body>
                      <Card.Title>{location.name}</Card.Title>
                      <Card.Text>
                        <FaMapMarkerAlt className="me-2" />
                        {location.address}
                        <br />
                        <FaUsers className="me-2" />
                        Capacità: {location.capacity} persone
                      </Card.Text>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          onClick={() => setSelectedLocation(location)}
                        >
                          Mostra sulla mappa
                        </Button>
                        <Link
                          to={`/locations/${location.id}`}
                          className="btn btn-primary"
                        >
                          Dettagli
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card style={{ position: 'sticky', top: '20px' }}>
            <Card.Body>
              <Card.Title>Mappa</Card.Title>
              <div style={{ height: '600px' }}>
                <MapContainer
                  center={selectedLocation 
                    ? [selectedLocation.latitude, selectedLocation.longitude]
                    : [45.4642, 9.1900]} // Milano come default
                  zoom={selectedLocation ? 15 : 12}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {locations.map(location => (
                    <Marker
                      key={location.id}
                      position={[location.latitude, location.longitude]}
                      eventHandlers={{
                        click: () => setSelectedLocation(location),
                      }}
                    >
                      <Popup>
                        <strong>{location.name}</strong>
                        <br />
                        {location.address}
                        <br />
                        Capacità: {location.capacity} persone
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Locations; 