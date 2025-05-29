import jwt from 'jsonwebtoken';
import 'dotenv/config';

const jwtSecretKey = process.env.JWT_SECRET_KEY;

const adminMiddleware = (req, res, next) => {
    try {
        // Verifica se il token è presente nell'header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token non fornito' });
        }

        // Verifica il token
        const decoded = jwt.verify(token, jwtSecretKey);
        
        // Verifica se l'utente è admin
        if (!decoded.isAdmin) {
            return res.status(403).json({ message: 'Accesso non autorizzato' });
        }

        // Aggiungi i dati dell'utente alla richiesta
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Errore durante la verifica admin:', error);
        return res.status(401).json({ message: 'Token non valido' });
    }
};

export default adminMiddleware; 