import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Form, Button, Card, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { createLocation, updateLocation, getLocationById } from '../../services/locations';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const LocationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState([45.4642, 9.1900]); // Milano come default
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    capacity: '',
    contactInfo: '',
    openingHours: '',
    latitude: position[0],
    longitude: position[1],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const locationData = await getLocationById(id);
          setFormData(locationData);
          setPosition([locationData.latitude, locationData.longitude]);
        } catch (err) {
          setError('Errore nel caricamento dei dati della location');
          console.error(err);
        }
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
    setFormData(prev => ({
      ...prev,
      latitude: newPosition[0],
      longitude: newPosition[1],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const locationData = {
        ...formData,
        capacity: parseInt(formData.capacity),
      };

      if (id) {
        await updateLocation(id, locationData);
      } else {
        await createLocation(locationData);
      }

      navigate('/admin');
    } catch (err) {
      setError('Errore nel salvataggio della location');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <Card>
        <Card.Body>
          <Card.Title as="h1">
            {id ? 'Modifica Location' : 'Nuova Location'}
          </Card.Title>

          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col lg={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Indirizzo</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descrizione</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Capacità</Form.Label>
                      <Form.Control
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        required
                        min="1"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Informazioni di contatto</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleChange}
                    placeholder="Email, telefono, ecc."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Orari di apertura</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="openingHours"
                    value={formData.openingHours}
                    onChange={handleChange}
                    placeholder="Es: Lun-Ven 9:00-18:00, Sab 10:00-16:00"
                  />
                </Form.Group>
              </Col>

              <Col lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Posizione sulla mappa</Form.Label>
                  <div style={{ height: '300px', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <MapContainer
                      center={position}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <LocationMarker
                        position={position}
                        setPosition={handlePositionChange}
                      />
                    </MapContainer>
                  </div>
                  <Form.Text className="text-muted">
                    Clicca sulla mappa per impostare la posizione
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Coordinate</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control
                        type="number"
                        step="any"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        required
                        readOnly
                      />
                      <Form.Text>Latitudine</Form.Text>
                    </Col>
                    <Col>
                      <Form.Control
                        type="number"
                        step="any"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        required
                        readOnly
                      />
                      <Form.Text>Longitudine</Form.Text>
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Salvataggio...
                  </>
                ) : (
                  'Salva'
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/admin')}
              >
                Annulla
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LocationForm; 