import 'dotenv/config';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import userModel from '../models/userModel.js';

// Configurazione Passport per il test
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('\nDati ricevuti da Google:');
        console.log('------------------------');
        console.log('Email:', profile._json.email);
        console.log('Nome:', profile._json.name);
        console.log('Google ID:', profile._json.sub);
        console.log('Email verificata:', profile._json.email_verified);
        console.log('------------------------\n');

        // Simula la creazione/ricerca utente
        const { email, name, sub: googleId, email_verified } = profile._json;
        
        let user = await userModel.findOne({ 
            $or: [
                { googleId },
                { email: email.toLowerCase() }
            ]
        });

        if (user) {
            console.log('Utente trovato nel database:');
            console.log('- ID:', user._id);
            console.log('- Username:', user.username);
            console.log('- Google ID:', user.googleId);
            console.log('- Verificato:', user.verified);
        } else {
            console.log('Creazione nuovo utente...');
            const newUser = new userModel({
                name,
                email: email.toLowerCase(),
                googleId,
                verified: email_verified
            });
            user = await newUser.save();
            console.log('Nuovo utente creato:');
            console.log('- ID:', user._id);
            console.log('- Username:', user.username);
            console.log('- Google ID:', user.googleId);
            console.log('- Verificato:', user.verified);
        }

        return done(null, user);
    } catch (error) {
        console.error('Errore durante il test:', error);
        return done(error);
    }
}));

// Funzione per simulare una richiesta di autenticazione
async function testGoogleAuth() {
    try {
        // Simula una richiesta di autenticazione
        console.log('Test autenticazione Google...');
        console.log('------------------------');
        console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Configurato' : 'Mancante');
        console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Configurato' : 'Mancante');
        console.log('Callback URL:', process.env.GOOGLE_CALLBACK_URL);
        console.log('------------------------\n');

        // Verifica la configurazione
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
            throw new Error('Configurazione Google OAuth incompleta. Verifica le variabili d\'ambiente.');
        }

        // URL di autenticazione
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent('profile email')}&` +
            `access_type=offline&` +
            `prompt=consent`;

        console.log('Per testare l\'autenticazione:');
        console.log('1. Apri questo URL nel browser:', authUrl);
        console.log('2. Accedi con il tuo account Google');
        console.log('3. Verifica i log per i dettagli dell\'autenticazione\n');

    } catch (error) {
        console.error('Errore durante il test:', error);
    }
}

// Esegui il test
testGoogleAuth(); 