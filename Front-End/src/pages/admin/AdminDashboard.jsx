import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Tab, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { getEvents, deleteEvent } from '../../services/events';
import { getLocations, deleteLocation } from '../../services/locations';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, locationsData] = await Promise.all([
          getEvents(),
          getLocations()
        ]);
        setEvents(eventsData);
        setLocations(locationsData);
      } catch {
        setError('Errore nel caricamento dei dati');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo evento?')) {
      try {
        await deleteEvent(id);
        setEvents(events.filter(event => event.id !== id));
      } catch {
        setError('Errore nell\'eliminazione dell\'evento');
      }
    }
  };

  const handleDeleteLocation = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa location?')) {
      try {
        await deleteLocation(id);
        setLocations(locations.filter(location => location.id !== id));
      } catch {
        setError('Errore nell\'eliminazione della location');
      }
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
      <h1 className="mb-4">Aggiungi il tuo evento</h1>

      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="events">
              <FaCalendarAlt className="me-2" />
              Eventi
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="locations">
              <FaMapMarkerAlt className="me-2" />
              Location
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="events">
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Card.Title>Gestione Eventi</Card.Title>
                  <Button
                    as={Link}
                    to="/admin/events/new"
                    variant="success"
                  >
                    <FaPlus className="me-2" />
                    Nuovo Evento
                  </Button>
                </div>

                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Titolo</th>
                        <th>Data</th>
                        <th>Location</th>
                        <th>Prezzo</th>
                        <th>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(event => (
                        <tr key={event.id}>
                          <td>{event.title}</td>
                          <td>{new Date(event.date).toLocaleDateString()}</td>
                          <td>{event.location.name}</td>
                          <td>{event.isFree ? 'Gratuito' : `€${event.price}`}</td>
                          <td>
                            <Button
                              as={Link}
                              to={`/admin/events/${event.id}/edit`}
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </Tab.Pane>

          <Tab.Pane eventKey="locations">
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Card.Title>Gestione Location</Card.Title>
                  <Button
                    as={Link}
                    to="/admin/locations/new"
                    variant="success"
                  >
                    <FaPlus className="me-2" />
                    Nuova Location
                  </Button>
                </div>

                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Indirizzo</th>
                        <th>Capacità</th>
                        <th>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.map(location => (
                        <tr key={location.id}>
                          <td>{location.name}</td>
                          <td>{location.address}</td>
                          <td>{location.capacity}</td>
                          <td>
                            <Button
                              as={Link}
                              to={`/admin/locations/${location.id}/edit`}
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteLocation(location.id)}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default AdminDashboard; 