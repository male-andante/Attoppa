import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { createEvent, updateEvent, getEventById } from '../../services/events';
import { getLocations } from '../../services/locations';

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    locationId: '',
    price: '',
    isFree: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const locationsData = await getLocations();
        setLocations(locationsData);

        if (id) {
          const eventData = await getEventById(id);
          setFormData({
            ...eventData,
            locationId: eventData.location.id,
            date: new Date(eventData.date).toISOString().split('T')[0],
          });
        }
      } catch (err) {
        setError('Errore nel caricamento dei dati');
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const eventData = {
        ...formData,
        price: formData.isFree ? 0 : parseFloat(formData.price),
      };

      if (id) {
        await updateEvent(id, eventData);
      } else {
        await createEvent(eventData);
      }

      navigate('/admin');
    } catch (err) {
      setError('Errore nel salvataggio dell\'evento');
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
            {id ? 'Modifica Evento' : 'Nuovo Evento'}
          </Card.Title>

          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Titolo</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
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
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Select
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                required
              >
                <option value="">Seleziona una location</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Orario</Form.Label>
                  <Form.Control
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Evento gratuito"
                name="isFree"
                checked={formData.isFree}
                onChange={handleChange}
              />
            </Form.Group>

            {!formData.isFree && (
              <Form.Group className="mb-3">
                <Form.Label>Prezzo (€)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            )}

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

export default EventForm; 