import { Container } from 'react-bootstrap';
import NavigationBar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
    console.log('Layout: Rendering...');
    return (
        <>
            {console.log('Layout: Rendering Navbar')}
            <NavigationBar />
            <div className="main-content">
                <Container className="py-4">
                    {console.log('Layout: Rendering children')}
                    {children}
                </Container>
            </div>
            {console.log('Layout: Rendering Footer')}
            <Footer />
        </>
    );
};

export default Layout; 