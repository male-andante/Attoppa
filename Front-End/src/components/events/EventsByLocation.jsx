import { Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import EventCard from './EventCard';

const EventsByLocation = ({ locationData, onInterested }) => {
    const { location, events } = locationData;

    return (
        <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">
                <h4 className="mb-0">
                    <Link 
                        to={`/locations/${location._id || location.id}`}
                        className="text-white text-decoration-none"
                    >
                        📍 {location.name}
                    </Link>
                </h4>
                <small>{events.length} eventi</small>
            </Card.Header>
            <Card.Body>
                <Row className="g-3">
                    {events.map(event => (
                        <Col key={event._id || event.id} xs={12} md={6} lg={4}>
                            <EventCard 
                                event={event}
                                onInterested={onInterested}
                            />
                        </Col>
                    ))}
                </Row>
            </Card.Body>
        </Card>
    );
};

export default EventsByLocation; 