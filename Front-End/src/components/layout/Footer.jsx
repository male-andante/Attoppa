import { Container, Row, Col } from 'react-bootstrap'

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row>
          <Col md={4}>
            <h5>Event Manager</h5>
            <p>La tua piattaforma per la gestione di eventi e location</p>
          </Col>
          <Col md={4}>
            <h5>Link Utili</h5>
            <ul className="list-unstyled">
              <li><a href="/about" className="text-light">Chi Siamo</a></li>
              <li><a href="/contact" className="text-light">Contatti</a></li>
              <li><a href="/privacy" className="text-light">Privacy Policy</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contatti</h5>
            <ul className="list-unstyled">
              <li>Email: info@eventmanager.com</li>
              <li>Tel: +39 123 456 7890</li>
              <li>Indirizzo: Via degli Eventi, 123</li>
            </ul>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col className="text-center">
            <p className="mb-0">&copy; {new Date().getFullYear()} Event Manager. Tutti i diritti riservati.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer 