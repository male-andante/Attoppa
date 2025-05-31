import { Card } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'

const AuthDebug = () => {
  const auth = useAuth()

  return (
    <Card className="mt-3">
      <Card.Header>Debug Auth State</Card.Header>
      <Card.Body>
        <pre>{JSON.stringify(auth, null, 2)}</pre>
      </Card.Body>
    </Card>
  )
}

export default AuthDebug 