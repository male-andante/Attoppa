import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Tab, Nav } from 'react-bootstrap';
import { FaUser, FaCalendarAlt, FaMapMarkerAlt, FaHeart } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { getFavoriteEvents } from '../services/events';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchFavoriteEvents = async () => {
      try {
        const events = await getFavoriteEvents();
        setFavoriteEvents(events);
      } catch (err) {
        console.error('Errore nel caricamento degli eventi preferiti:', err);
      }
    };

    if (user) {
      fetchFavoriteEvents();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
      });
      setSuccess('Profilo aggiornato con successo');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setError('Errore nell\'aggiornamento del profilo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Le password non coincidono');
      setLoading(false);
      return;
    }

    try {
      await updateProfile({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess('Password aggiornata con successo');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setError('Errore nell\'aggiornamento della password');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          Effettua il login per accedere al tuo profilo
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Profilo</h1>

      <Tab.Container defaultActiveKey="profile">
        <Row>
          <Col lg={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="profile">
                  <FaUser className="me-2" />
                  Dati Profilo
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="password">
                  <FaUser className="me-2" />
                  Cambia Password
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="favorites">
                  <FaHeart className="me-2" />
                  Eventi Preferiti
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

          <Col lg={9}>
            <Tab.Content>
              <Tab.Pane eventKey="profile">
                <Card>
                  <Card.Body>
                    <Card.Title>Dati Profilo</Card.Title>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form onSubmit={handleProfileUpdate}>
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
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>

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
                            Aggiornamento...
                          </>
                        ) : (
                          'Aggiorna Profilo'
                        )}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="password">
                <Card>
                  <Card.Body>
                    <Card.Title>Cambia Password</Card.Title>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form onSubmit={handlePasswordUpdate}>
                      <Form.Group className="mb-3">
                        <Form.Label>Password Attuale</Form.Label>
                        <Form.Control
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Nuova Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Conferma Nuova Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>

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
                            Aggiornamento...
                          </>
                        ) : (
                          'Cambia Password'
                        )}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="favorites">
                <Card>
                  <Card.Body>
                    <Card.Title>Eventi Preferiti</Card.Title>
                    {favoriteEvents.length === 0 ? (
                      <Alert variant="info">
                        Non hai ancora eventi preferiti
                      </Alert>
                    ) : (
                      <div className="events-grid">
                        {favoriteEvents.map(event => (
                          <Card key={event.id} className="mb-3">
                            <Card.Body>
                              <Card.Title>{event.title}</Card.Title>
                              <Card.Text>
                                <FaCalendarAlt className="me-2" />
                                {new Date(event.date).toLocaleDateString()}
                                <br />
                                <FaMapMarkerAlt className="me-2" />
                                {event.location.name}
                              </Card.Text>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default Profile; 