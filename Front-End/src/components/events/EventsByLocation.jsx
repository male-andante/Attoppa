import { Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import EventCard from './EventCard';
import './EventsByLocation.css';

const EventsByLocation = ({ locationData, onInterested }) => {
    const { location, events } = locationData || {};

    // Gestione sicura per evitare errori se locationData è undefined
    if (!location || !events) {
        return null;
    }

    // Gestisci il caso di location senza ID (es. "Location non specificata")
    const locationId = location._id || location.id;
    const locationName = location.name || 'Location';

    return (
        <div className="events-by-location-section mb-4">
            <div className="events-by-location-header px-3 py-2">
                <h4 className="mb-0">
                    {locationId ? (
                        <Link 
                            to={`/locations/${locationId}`}
                            className="text-decoration-none"
                        >
                            📍 {locationName}
                        </Link>
                    ) : (
                        <span>📍 {locationName}</span>
                    )}
                </h4>
                <small>{events.length || 0} eventi</small>
            </div>
            <div className="events-by-location-body">
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
            </div>
        </div>
    );
};

export default EventsByLocation; 