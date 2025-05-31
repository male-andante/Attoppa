import { useState } from 'react'
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    isAdmin: false
  })
  const [validated, setValidated] = useState(false)
  const [error, setError] = useState('')
  
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validatePassword = (password) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (password.length < minLength) {
      return 'La password deve essere di almeno 8 caratteri'
    }
    if (!hasUpperCase) {
      return 'La password deve contenere almeno una lettera maiuscola'
    }
    if (!hasLowerCase) {
      return 'La password deve contenere almeno una lettera minuscola'
    }
    if (!hasNumbers) {
      return 'La password deve contenere almeno un numero'
    }
    if (!hasSpecialChar) {
      return 'La password deve contenere almeno un carattere speciale'
    }
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    
    if (form.checkValidity() === false) {
      e.stopPropagation()
      setValidated(true)
      return
    }

    // Validazione password
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    // Verifica che le password coincidano
    if (formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono')
      return
    }

    try {
      setError('')
      const { confirmPassword: _, ...registrationData } = formData
      const redirectTo = await register(registrationData)
      navigate(redirectTo)
    } catch (error) {
      setError(error.response?.data?.message || 'Errore durante la registrazione')
    }
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="text-center mb-4">Registrazione</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Scegli un username"
                  />
                  <Form.Control.Feedback type="invalid">
                    Username obbligatorio
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Inserisci la tua email"
                  />
                  <Form.Control.Feedback type="invalid">
                    Inserisci un'email valida
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Crea una password"
                  />
                  <Form.Text className="text-muted">
                    La password deve contenere almeno 8 caratteri, una lettera maiuscola, 
                    una minuscola, un numero e un carattere speciale
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Conferma Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Conferma la password"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="isAdmin"
                    label="Registrati come amministratore"
                    checked={formData.isAdmin}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Registrazione in corso...' : 'Registrati'}
                </Button>

                <div className="text-center">
                  <p className="mb-0">
                    Hai già un account?{' '}
                    <Link to="/login">Accedi</Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Register 