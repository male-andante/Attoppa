// Importo le dipendenze necessario per il progetto
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import 'dotenv/config';

// Import Model
import userModel from "../models/userModel.js"

// Import Middleware
import authMiddleware from "../middlewares/authMiddleware.js" 
import adminMiddleware from '../middlewares/adminMiddleware.js';

const saltRounds = +process.env.SALT_ROUNDS;
const jwtSecretKey = process.env.JWT_SECRET_KEY;


const authRouter = express.Router()

// Ogg che invierà il client tramite una chiamata ajax
/* {
    "fullname" : "John Smith",
    "username" : "johnsmith",
    "email" : "johnsmith@example.com",
    "password" : "Pa$$w0rd!",
    "verified" : false
} */

// Register Route
authRouter.post('/register', async(req, res) => {
    try {
        const { username, email, password, isAdmin } = req.body;

        // Verifica se l'utente esiste già
        const existingUser = await userModel.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                message: existingUser.email === email ? 
                    'Email già registrata' : 
                    'Username già in uso'
            });
        }

        // Hash della password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Creazione nuovo utente
        const user = new userModel({
            ...req.body,
            password: hashedPassword
        });

        const userSaved = await user.save();
        
        // Rimuovo la password dalla risposta
        const userResponse = userSaved.toObject();
        delete userResponse.password;

        // Genero il token
        const token = jwt.sign(
            {
                id: userSaved.id,
                username: userSaved.username,
                fullname: userSaved.fullname,
                email: userSaved.email,
                isAdmin: userSaved.isAdmin
            },
            jwtSecretKey, 
            { expiresIn: '1h' }
        );
        
        // Restituisco la risposta con il token e l'indicazione se è admin
        return res.status(201).json({
            user: userResponse,
            token,
            redirectTo: userSaved.isAdmin ? '/dashboard' : '/'
        });
    } catch (error) {
        console.error('Errore durante la registrazione:', error);
        return res.status(500).json({ message: 'Errore durante la registrazione' });
    }
});

// Login Route
authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validazione input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email e password sono obbligatori' });
        }

        // Ricerca utente
        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Credenziali non valide' });
        }

        // Verifica password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Credenziali non valide' });
        }

        // Generazione token
        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email,
                isAdmin: user.isAdmin 
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );

        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            status: 'success',
            data: {
                user: userResponse,
                token,
                redirectTo: user.isAdmin ? '/dashboard' : '/'
            }
        });
    } catch (error) {
        console.error('Errore durante il login:', error);
        res.status(500).json({ message: 'Errore durante il login' });
    }
});

// Google Auth Routes
authRouter.get('/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

authRouter.get('/google/callback',
    passport.authenticate('google', { 
        session: false,
        failureRedirect: '/login'
    }),
    (req, res) => {
        try {
            // Reindirizza al frontend con il token
            res.redirect(`${process.env.AUTH_CALLBACK_URL}?token=${req.user.accessToken}`);
        } catch (error) {
            console.error('Errore durante la callback di Google:', error);
            res.redirect(`${process.env.AUTH_CALLBACK_URL}?error=auth_failed`);
        }
    }
);

// Verifica Token Route
authRouter.get('/verify', authMiddleware, (req, res) => {
    try {
        res.status(200).json({ 
            message: 'Token valido',
            user: req.user
        });
    } catch (error) {
        console.error('Errore durante la verifica del token:', error);
        res.status(401).json({ message: 'Token non valido' });
    }
});

// Funzione Soluzione 2 creazione di un token
const generateToken = (payload) => {
    return new Promise((res, rej) => {
        jwt.sign(payload, jwtSecretKey, { expiresIn: '1h' }, (err, token) => {
            if(err) rej(err)
            else res(token)
        });
    })
}

// Route protetta per admin
authRouter.get('/dashboard', adminMiddleware, (req, res) => {
    // Solo gli admin possono accedere qui
    res.json({ message: 'Benvenuto nella dashboard. Inserisci il tuo evento o la tua location' });
});

// Export Router
export default authRouter;