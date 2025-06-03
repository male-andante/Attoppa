import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import 'bootstrap/dist/css/bootstrap.min.css';

// Importazione pagine (le creeremo dopo)
const Home = () => <div>Home Page</div>;
const Login = () => <div>Login Page</div>;
const Register = () => <div>Register Page</div>;
const Events = () => <div>Events Page</div>;
const EventDetail = () => <div>Event Detail Page</div>;
const Locations = () => <div>Locations Page</div>;
const LocationDetail = () => <div>Location Detail Page</div>;
const Profile = () => <div>Profile Page</div>;
const AdminDashboard = () => <div>Admin Dashboard</div>;
const Settings = () => <div>Settings Page</div>;

function App() {
    return (
        <Router>
            <AuthProvider>
                <Layout>
                    <Routes>
                        {/* Route pubbliche */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/events/:id" element={<EventDetail />} />
                        <Route path="/locations" element={<Locations />} />
                        <Route path="/locations/:id" element={<LocationDetail />} />

                        {/* Route protette */}
                        <Route element={<PrivateRoute />}>
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/settings" element={<Settings />} />
                        </Route>

                        {/* Route admin */}
                        <Route element={<AdminRoute />}>
                            <Route path="/admin" element={<AdminDashboard />} />
                        </Route>
                    </Routes>
                </Layout>
            </AuthProvider>
        </Router>
    );
}

export default App;
