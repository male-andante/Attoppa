import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-palestine-green text-light py-4 mt-5">
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} className="text-center text-white">
                        <small>&copy; {new Date().getFullYear()} Attoppa. Tutti i diritti riservati. Made by male_andante</small>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer; 