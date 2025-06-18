import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        const error = queryParams.get('error');

        console.log('=== AUTH CALLBACK DEBUG ===');
        console.log('Token received:', token);
        console.log('Error received:', error);
        console.log('Full URL:', window.location.href);

        if (error) {
            console.error("AuthCallback: Errore ricevuto dall'URL:", error);
            navigate('/login');
            return;
        }

        if (token) {
            console.log("AuthCallback: Token ricevuto", token);
            
            // Decodifica il token per vedere il contenuto (solo per debug)
            try {
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    console.log('Token payload (decoded):', payload);
                }
            } catch {
                console.log('Impossibile decodificare il token');
            }
            
            loginWithToken(token)
                .then(() => {
                    console.log("AuthCallback: Login completato con successo");
                    navigate('/'); // Reindirizza l'utente alla home page
                })
                .catch((error) => {
                    console.error("AuthCallback: Errore durante il login", error);
                    navigate('/login'); // Reindirizza al login in caso di errore
                });
        } else {
            console.error("AuthCallback: Token non trovato nell'URL.");
            navigate('/login'); // Reindirizza al login se il token non è presente
        }
    }, [location, navigate, loginWithToken]);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
            <div className="text-center">
                <h2>Accesso in corso...</h2>
                <p>Attendere prego, stiamo completando l'autenticazione.</p>
            </div>
        </div>
    );
}

export default AuthCallback; 