import { Container } from 'react-bootstrap';
import NavigationBar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <>
            <NavigationBar />
            <Container className="py-4">
                {children}
            </Container>
            <Footer />
        </>
    );
};

export default Layout; 