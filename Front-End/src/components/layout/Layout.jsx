import { Container } from 'react-bootstrap'
import NavigationBar from './Navbar'
import Footer from './Footer'

const Layout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavigationBar />
      <Container className="flex-grow-1">
        {children}
      </Container>
      <Footer />
    </div>
  )
}

export default Layout 