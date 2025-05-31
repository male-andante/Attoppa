import { useState } from 'react'
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice'
import GoogleLogin from '../components/auth/GoogleLogin'
import AuthDebug from '../components/auth/AuthDebug'
import axios from 'axios'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [validated, setValidated] = useState(false)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    
    if (form.checkValidity() === false) {
      e.stopPropagation()
      setValidated(true)
      return
    }

    try {
      dispatch(loginStart())
      const response = await axios.post('http://localhost:3000/auth/login', formData)
      dispatch(loginSuccess(response.data.data))
      navigate(response.data.data.redirectTo || '/')
    } catch (error) {
      dispatch(loginFailure(error.response?.data?.message || 'Errore durante il login'))
    }
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="text-center mb-4">Login</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
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
                    placeholder="Inserisci la tua password"
                  />
                  <Form.Control.Feedback type="invalid">
                    La password è obbligatoria
                  </Form.Control.Feedback>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Accesso in corso...' : 'Accedi'}
                </Button>

                <div className="text-center mb-3">
                  <span className="text-muted">oppure</span>
                </div>

                <GoogleLogin />

                <div className="text-center">
                  <p className="mb-0">
                    Non hai un account?{' '}
                    <Link to="/register">Registrati</Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          {import.meta.env.DEV && <AuthDebug />}
        </Col>
      </Row>
    </Container>
  )
}

export default Login 