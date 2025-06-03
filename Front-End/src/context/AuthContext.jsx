import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Verifica se l'utente è già loggato al caricamento
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await fetch('http://localhost:3000/auth/verify', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setUser(data.user);
                    } else {
                        localStorage.removeItem('token');
                    }
                }
            } catch (err) {
                console.error('Errore nella verifica dell\'autenticazione:', err);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    // Login con email/password
    const login = async (email, password) => {
        try {
            setError(null);
            const response = await fetch('http://localhost:3000/auth/login', {
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
            return data.user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Registrazione
    const register = async (userData) => {
        try {
            setError(null);
            const response = await fetch('http://localhost:3000/auth/register', {
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

            localStorage.setItem('token', data.token);
            setUser(data.user);
            return data.user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    // Login con Google
    const loginWithGoogle = () => {
        window.location.href = 'http://localhost:3000/auth/google';
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        loginWithGoogle,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 