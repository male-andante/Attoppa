import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        if (token) {
            console.log("AuthCallback: Token ricevuto", token);
            login(token); // Imposta il token nel contesto di autenticazione
            navigate('/'); // Reindirizza l'utente alla home page
        } else {
            console.error("AuthCallback: Token non trovato nell'URL.");
            navigate('/login'); // Reindirizza al login se il token non è presente
        }
    }, [location, navigate, login]);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
            <div className="text-center">
                <h2>Accesso in corso...</h2>
                <p>Attendere prego, stiamo reindirizzando.</p>
            </div>
        </div>
    );
}

export default AuthCallback; 