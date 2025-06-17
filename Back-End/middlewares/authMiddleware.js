// Importo le dipendenze necessario per il progetto
import jwt from 'jsonwebtoken';
import 'dotenv/config';
const jwtSecretKey = process.env.JWT_SECRET_KEY;

// Import Model
import userModel from "../models/userModel.js"

// Middleware
const authMiddleware = async (req, res, next) => {
    //console.log("Sono authMiddleware!")
    try {
        const tokenBearer = req.headers.authorization
        if(tokenBearer !== undefined){
            const token = tokenBearer.replace('Bearer ', '')
            const data = await verifyJWT(token)
            console.log('Token decodificato:', data)
            if(data.exp) {
                const me = await userModel.findById(data.id)
                if(me) {
                    req.user = me
                    next()
                } else {
                    res.status(401).json({ message: 'Utente non trovato!' })
                }
            } else {
                res.status(401).json({ message: 'Token scaduto! Riprova il login!' })
            }
        } else {
            res.status(401).json({ message: 'Token richiesto!' })
        } 
        
    } catch(err) {
        console.error('Errore nel middleware di autenticazione:', err)
        res.status(401).json({ message: 'Token non valido!' })
    }
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