import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = () => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return <div>Caricamento...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute; 