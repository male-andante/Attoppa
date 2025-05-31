import { Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const LogoutButton = ({ variant = 'outline-danger', className = '' }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Errore durante il logout:', error)
      navigate('/')
    }
  }

  return (
    <Button 
      variant={variant} 
      onClick={handleLogout}
      className={className}
    >
      Logout
    </Button>
  )
}

export default LogoutButton 