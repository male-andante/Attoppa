import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-dark text-light py-4 mt-5">
            <Container>
                <Row>
                    <Col md={4}>
                        <h5>Attoppa</h5>
                        <p className="text-muted">
                            La tua guida agli eventi techno
                        </p>
                    </Col>
                    <Col md={4}>
                        <h5>Link Utili</h5>
                        <ul className="list-unstyled">
                            <li><a href="/about" className="text-muted">Chi Siamo</a></li>
                            <li><a href="/contact" className="text-muted">Contatti</a></li>
                            <li><a href="/privacy" className="text-muted">Privacy Policy</a></li>
                        </ul>
                    </Col>
                    <Col md={4}>
                        <h5>Contatti</h5>
                        <ul className="list-unstyled text-muted">
                            <li>Email: info@attoppa.com</li>
                            <li>Tel: +39 123 456 7890</li>
                        </ul>
                    </Col>
                </Row>
                <Row className="mt-3">
                    <Col className="text-center text-muted">
                        <small>&copy; {new Date().getFullYear()} Attoppa. Tutti i diritti riservati. Made by male_andante</small>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer; 