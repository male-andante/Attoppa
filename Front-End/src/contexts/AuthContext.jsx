import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../services/config';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    console.log('AuthProvider: Initializing...');
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('AuthProvider: Checking auth...');
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            console.log('AuthProvider: Starting auth check...');
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('AuthProvider: No token found');
                setLoading(false);
                return;
            }

            console.log('AuthProvider: Token found, verifying...');
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('AuthProvider: User authenticated', data);
                setUser(data);
                setIsAuthenticated(true);
                setIsAdmin(data.role === 'admin');
            } else {
                console.log('AuthProvider: Token invalid');
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('AuthProvider: Auth check error:', error);
        } finally {
            setLoading(false);
            console.log('AuthProvider: Auth check completed');
        }
    };

    const login = async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Errore durante il login');
        }

        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        setIsAdmin(data.user.role === 'admin');
        return data;
    };

    const register = async (userData) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Errore durante la registrazione');
        }

        return data;
    };

    const loginWithToken = async (token) => {
        try {
            // Salva il token nel localStorage
            localStorage.setItem('token', token);
            
            // Verifica il token e ottieni i dati dell'utente
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                setIsAuthenticated(true);
                setIsAdmin(userData.role === 'admin');
                return userData;
            } else {
                throw new Error('Token non valido');
            }
        } catch (error) {
            console.error('Errore durante il login con token:', error);
            localStorage.removeItem('token');
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
    };

    const loginWithGoogle = () => {
        window.location.href = `${API_URL}/auth/google`;
    };

    const value = {
        user,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        loginWithToken,
        register,
        logout,
        loginWithGoogle
    };

    return (
        <AuthContext.Provider value={value}>
            {console.log('AuthProvider: Rendering children, loading:', loading)}
            {loading ? <div>Caricamento autenticazione...</div> : children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 