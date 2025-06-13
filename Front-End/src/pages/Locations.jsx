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
    <Container fluid className="my-5 px-3 px-md-5">
      <Row>
        <Col lg={12}>
          <div className="mb-4 p-4 bg-white">
            <h1>Location</h1>
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

            <Row>
              {filteredLocations.map(location => (
                <Col key={location._id || location.id} xs={12} md={6} className="mb-3">
                  <Card>
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
                        <Link
                          to={`/locations/${location._id || location.id}`}
                          className="btn btn-primary"
                        >
                          Dettagli
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Locations; 