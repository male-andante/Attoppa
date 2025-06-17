// Importo le dipendenze necessario per il progetto
import jwt from 'jsonwebtoken';
import 'dotenv/config';
const jwtSecretKey = process.env.JWT_SECRET_KEY;

// Import Model
import userModel from "../models/userModel.js"

// Middleware
const authMiddleware = async (req, res, next) => {
    console.log("=== AUTH MIDDLEWARE START ===");
    try {
        const tokenBearer = req.headers.authorization
        console.log('Authorization header:', tokenBearer);
        
        if(tokenBearer !== undefined){
            const token = tokenBearer.replace('Bearer ', '')
            console.log('Token estratto:', token.substring(0, 50) + '...');
            
            const data = await verifyJWT(token)
            console.log('Token decodificato:', data);
            
            if(data.exp) {
                console.log('Token non scaduto, cercando utente con ID:', data.id);
                const me = await userModel.findById(data.id)
                if(me) {
                    console.log('Utente trovato:', me.email);
                    req.user = me
                    next()
                } else {
                    console.log('Utente non trovato nel database');
                    res.status(401).json({ message: 'Utente non trovato!' })
                }
            } else {
                console.log('Token scaduto');
                res.status(401).json({ message: 'Token scaduto! Riprova il login!' })
            }
        } else {
            console.log('Nessun token fornito');
            res.status(401).json({ message: 'Token richiesto!' })
        } 
        
    } catch(err) {
        console.error('Errore nel middleware di autenticazione:', err)
        res.status(401).json({ message: 'Token non valido!' })
    }
    console.log("=== AUTH MIDDLEWARE END ===");
}


const verifyJWT = (token) => {
    return new Promise((res, rej) => {
        jwt.verify(token, jwtSecretKey, (err, data) => {
            if(err) rej(err)
            else res(data)
        })
    })
}

export default authMiddleware;