import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Locations from './pages/Locations';
import LocationDetail from './pages/LocationDetail';
import MyEvents from './pages/MyEvents';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import EventForm from './pages/admin/EventForm';
import LocationForm from './pages/admin/LocationForm';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    console.log('App: Rendering...');
  return (
        <Router>
            <AuthProvider>
                <Layout>
                    {console.log('App: Layout rendered')}
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
                            <Route path="/my-events" element={<MyEvents />} />
                        </Route>

                        {/* Route admin */}
                        <Route element={<AdminRoute />}>
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/admin/events/new" element={<EventForm />} />
                            <Route path="/admin/events/:id/edit" element={<EventForm />} />
                            <Route path="/admin/locations/new" element={<LocationForm />} />
                            <Route path="/admin/locations/:id/edit" element={<LocationForm />} />
                        </Route>
                    </Routes>
                </Layout>
            </AuthProvider>
        </Router>
    );
}

export default App;
