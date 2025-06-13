import { useState } from 'react';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaBell, FaGlobe, FaLock } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { user, updateSettings } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    language: 'it',
    theme: 'light',
    privacy: {
      showEmail: false,
      showInterests: true,
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('privacy.')) {
      const privacyField = name.split('.')[1];
      setSettings(prev => ({
        ...prev,
        privacy: {
          ...prev.privacy,
          [privacyField]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateSettings(settings);
      setSuccess('Impostazioni aggiornate con successo');
    } catch (err) {
      setError('Errore nell\'aggiornamento delle impostazioni');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          Effettua il login per accedere alle impostazioni
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Impostazioni</h1>

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Card.Title className="mb-4">
              <FaBell className="me-2" />
              Notifiche
            </Card.Title>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="emailNotifications"
                name="emailNotifications"
                label="Notifiche email"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />
              <Form.Text className="text-muted">
                Ricevi aggiornamenti via email sugli eventi che ti interessano
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Check
                type="switch"
                id="pushNotifications"
                name="pushNotifications"
                label="Notifiche push"
                checked={settings.pushNotifications}
                onChange={handleChange}
              />
              <Form.Text className="text-muted">
                Ricevi notifiche push sul browser per gli eventi nelle vicinanze
              </Form.Text>
            </Form.Group>

            <Card.Title className="mb-4">
              <FaGlobe className="me-2" />
              Preferenze
            </Card.Title>

            <Form.Group className="mb-3">
              <Form.Label>Lingua</Form.Label>
              <Form.Select
                name="language"
                value={settings.language}
                onChange={handleChange}
              >
                <option value="it">Italiano</option>
                <option value="en">English</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Tema</Form.Label>
              <Form.Select
                name="theme"
                value={settings.theme}
                onChange={handleChange}
              >
                <option value="light">Chiaro</option>
                <option value="dark">Scuro</option>
                <option value="system">Sistema</option>
              </Form.Select>
            </Form.Group>

            <Card.Title className="mb-4">
              <FaLock className="me-2" />
              Privacy
            </Card.Title>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="privacy.showEmail"
                name="privacy.showEmail"
                label="Mostra email nel profilo"
                checked={settings.privacy.showEmail}
                onChange={handleChange}
              />
              <Form.Text className="text-muted">
                Rendi visibile il tuo indirizzo email agli altri utenti
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Check
                type="switch"
                id="privacy.showInterests"
                name="privacy.showInterests"
                label="Mostra eventi preferiti"
                checked={settings.privacy.showInterests}
                onChange={handleChange}
              />
              <Form.Text className="text-muted">
                Rendi visibili gli eventi a cui sei interessato
              </Form.Text>
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
                  Salvataggio...
                </>
              ) : (
                'Salva Impostazioni'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Settings; 