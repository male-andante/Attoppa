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
authRouter.post('/register', async (req, res) => {
    try {
        console.log('=== INIZIO REGISTRAZIONE ===');
        console.log('Dati ricevuti:', JSON.stringify(req.body, null, 2));
        
        const { username, email, password, name, adminCode } = req.body;
        console.log('Dati estratti:', { username, email, name, hasAdminCode: !!adminCode });

        // Validazione campi obbligatori
        if (!name) {
            console.log('Errore: nome mancante');
            return res.status(400).json({ message: 'Il nome è obbligatorio' });
        }
        if (!email) {
            console.log('Errore: email mancante');
            return res.status(400).json({ message: 'L\'email è obbligatoria' });
        }
        if (!password) {
            console.log('Errore: password mancante');
            return res.status(400).json({ message: 'La password è obbligatoria' });
        }
        if (!username) {
            console.log('Errore: username mancante');
            return res.status(400).json({ message: 'Username generato non valido' });
        }

        // Verifica codice admin (se fornito)
        const isAdmin = adminCode === process.env.ADMIN_SECRET_CODE;
        if (adminCode && !isAdmin) {
            console.log('Errore: codice admin non valido');
            return res.status(400).json({ message: 'Codice admin non valido' });
        }

        // Verifica se l'utente esiste già
        console.log('Verifica utente esistente...');
        const existingUser = await userModel.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            console.log('Utente già esistente:', existingUser.email === email ? 'email duplicata' : 'username duplicato');
            return res.status(400).json({ 
                message: existingUser.email === email ? 
                    'Email già registrata' : 
                    'Username già in uso'
            });
        }

        // Hash della password
        console.log('Generazione hash password...');
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Creazione nuovo utente
        console.log('Creazione nuovo utente...');
        const user = new userModel({
            name,
            username,
            email,
            password: hashedPassword,
            isAdmin: isAdmin
        });

        console.log('Tentativo di salvataggio utente:', JSON.stringify(user, null, 2));
        const userSaved = await user.save();
        console.log('Utente salvato con successo:', JSON.stringify(userSaved, null, 2));
        
        // Rimuovo la password dalla risposta
        const userResponse = userSaved.toObject();
        delete userResponse.password;

        // Genero il token
        console.log('Generazione token...');
        const token = jwt.sign(
            {
                id: userSaved.id,
                username: userSaved.username,
                name: userSaved.name,
                email: userSaved.email,
                isAdmin: userSaved.isAdmin
            },
            jwtSecretKey, 
            { expiresIn: '1h' }
        );
        
        console.log('=== REGISTRAZIONE COMPLETATA CON SUCCESSO ===');
        // Restituisco la risposta con il token e l'indicazione se è admin
        return res.status(201).json({
            user: userResponse,
            token,
            redirectTo: userSaved.isAdmin ? '/dashboard' : '/'
        });
    } catch (error) {
        console.error('=== ERRORE DURANTE LA REGISTRAZIONE ===');
        console.error('Tipo di errore:', error.constructor.name);
        console.error('Messaggio di errore:', error.message);
        console.error('Stack trace:', error.stack);
        if (error.name === 'ValidationError') {
            console.error('Errori di validazione:', error.errors);
            return res.status(400).json({ 
                message: 'Dati non validi',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        return res.status(500).json({ 
            message: 'Errore durante la registrazione',
            error: error.message
        });
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
authRouter.get('/google', (req, res, next) => {
    console.log('=== GOOGLE AUTH INIT ===');
    console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Presente' : 'Mancante');
    console.log('Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Presente' : 'Mancante');
    console.log('Google Callback URL:', process.env.GOOGLE_CALLBACK_URL);
    console.log('Frontend URL:', process.env.FRONTEND_VERCEL_URL);
    next();
}, passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
}));

authRouter.get('/google/callback',
    passport.authenticate('google', { 
        session: false,
        failureRedirect: '/login'
    }),
    (req, res) => {
        console.log('=== GOOGLE CALLBACK START ===');
        console.log('User object:', req.user);
        console.log('User ID:', req.user?._id);
        console.log('User email:', req.user?.email);
        
        try {
            console.log('Google callback - User data:', req.user);
            
            if (!req.user) {
                console.error('No user object found in request');
                return res.redirect(`${process.env.FRONTEND_VERCEL_URL}/auth-callback?error=no_user`);
            }
            
            if (!req.user._id) {
                console.error('No user ID found in user object');
                return res.redirect(`${process.env.FRONTEND_VERCEL_URL}/auth-callback?error=no_user_id`);
            }
            
            // Genera il token
            const tokenPayload = {
                id: req.user._id, // Usa _id invece di id per essere coerente
                email: req.user.email,
                isAdmin: req.user.isAdmin
            };
            
            console.log('Token payload:', tokenPayload);
            
            const token = jwt.sign(
                tokenPayload,
                jwtSecretKey,
                { expiresIn: '1h' }
            );

            console.log('Token generated:', token.substring(0, 50) + '...');

            // Aggiungiamo un log per vedere l'URL di reindirizzamento
            const redirectUrl = `${process.env.FRONTEND_VERCEL_URL}/auth-callback?token=${token}`;
            console.log('Reindirizzamento a:', redirectUrl);

            // Reindirizza al frontend con il token (uso direttamente l'URL di Vercel)
            res.redirect(redirectUrl);
        } catch (error) {
            console.error('Errore durante la callback di Google:', error);
            res.redirect(`${process.env.FRONTEND_VERCEL_URL}/auth-callback?error=auth_failed`);
        }
        console.log('=== GOOGLE CALLBACK END ===');
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

// Get Current User Route
authRouter.get('/me', authMiddleware, async (req, res) => {
    try {
        // req.user è già popolato da authMiddleware
        const userResponse = req.user.toObject();
        delete userResponse.password; // Rimuoviamo la password dalla risposta
        
        res.status(200).json(userResponse);
    } catch (error) {
        console.error('Errore durante il recupero dati utente:', error);
        res.status(500).json({ message: 'Errore durante il recupero dati utente' });
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

// Endpoint per promuovere un utente ad admin (solo per admin esistenti)
authRouter.post('/promote-admin', adminMiddleware, async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email richiesta' });
        }

        const user = await userModel.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        if (user.isAdmin) {
            return res.status(400).json({ message: 'L\'utente è già admin' });
        }

        user.isAdmin = true;
        await user.save();

        res.json({ 
            message: 'Utente promosso ad admin con successo',
            user: {
                name: user.name,
                email: user.email,
                username: user.username,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Errore durante la promozione ad admin:', error);
        res.status(500).json({ message: 'Errore durante la promozione ad admin' });
    }
});

// Export Router
export default authRouter;