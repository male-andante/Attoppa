import { useState, useEffect } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { getEventsGroupedByLocation, toggleInterested } from '../services/events';
import EventsByLocation from '../components/events/EventsByLocation';
import Pagination from '../components/common/Pagination';
import './Home.css';

const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const [groupedEvents, setGroupedEvents] = useState({});
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Carica gli eventi raggruppati per location
    useEffect(() => {
        const loadEvents = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const data = await getEventsGroupedByLocation(currentPage, 12);
                setGroupedEvents(data.groupedEvents);
                setPagination(data.pagination);
            } catch (err) {
                console.error('Errore nel caricamento degli eventi:', err);
                setError('Errore nel caricamento degli eventi.');
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, [currentPage]);

    const handleInterested = async (eventId) => {
        try {
            await toggleInterested(eventId);
            
            // Aggiorna lo stato locale per riflettere il cambiamento
            setGroupedEvents(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(locationName => {
                    updated[locationName].events = updated[locationName].events.map(event => {
                        if ((event._id || event.id) === eventId) {
                            return {
                                ...event,
                                isInterested: !event.isInterested,
                                interestedUsers: event.isInterested
                                    ? event.interestedUsers?.filter(id => id !== user?.id) || []
                                    : [...(event.interestedUsers || []), user?.id]
                            };
                        }
                        return event;
                    });
                });
                return updated;
            });
        } catch (err) {
            console.error('Errore nell\'aggiornamento dell\'interesse:', err);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0); // Scroll to top when changing page
    };

    if (loading) {
        return (
            <Container className="text-center py-5 home-responsive-container">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="home-responsive-container">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    const locationNames = Object.keys(groupedEvents);

    return (
        <Container className="home-responsive-container">
            {/* Messaggio di benvenuto */}
            <div className="welcome-section">
                <h1 className="display-6">
                    {isAuthenticated && user 
                        ? `Benvenuto, ${user.name}!` 
                        : 'Benvenuto su Attoppa!'
                    }
                </h1>
                <p className="lead">
                    {isAuthenticated 
                        ? 'Questi sono gli eventi per te:'
                        : 'Scopri i migliori eventi techno della tua zona!'
                    }
                </p>
                {!isAuthenticated && (
                    <p className="text-muted">
                        <a href="/login" className="text-decoration-none">Accedi</a> per salvare i tuoi eventi preferiti!
                    </p>
                )}
            </div>

            {/* Eventi raggruppati per location */}
            {locationNames.length === 0 ? (
                <Alert variant="info">
                    Nessun evento disponibile al momento.
                </Alert>
            ) : (
                <>
                    {locationNames.map(locationName => (
                        <EventsByLocation
                            key={locationName}
                            locationData={groupedEvents[locationName]}
                            onInterested={handleInterested}
                        />
                    ))}
                    
                    {/* Paginazione */}
                    <Pagination
                        currentPage={pagination.currentPage || 1}
                        totalPages={pagination.totalPages || 1}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </Container>
    );
};

export default Home; 