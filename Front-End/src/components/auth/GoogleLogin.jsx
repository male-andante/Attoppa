import { Button } from 'react-bootstrap'
import { FaGoogle } from 'react-icons/fa'

const GoogleLogin = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google'
  }

  return (
    <Button
      variant="outline-danger"
      className="w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
      onClick={handleGoogleLogin}
    >
      <FaGoogle />
      Accedi con Google
    </Button>
  )
}

export default GoogleLogin 