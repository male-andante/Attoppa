import 'dotenv/config';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
const jwtSecretKey = process.env.JWT_SECRET_KEY;

// Import Model
import userModel from "../models/userModel.js"

const googleStrategy = new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    }, async function(accessToken, refreshToken, profile, done) {
        console.log('=== GOOGLE STRATEGY START ===');
        console.log('Profile received:', profile.id);
        console.log('Profile email:', profile._json.email);
        
        try {
            // Destrutturo le informazioni da Google
            const { 
                email, 
                name, 
                given_name, 
                family_name, 
                email_verified,
                sub: googleId 
            } = profile._json;

            console.log('Extracted data:', { email, name, googleId, email_verified });

            // Normalizza il nome per la generazione dell'username, fallback all'email se il nome non è utile
            const baseForUsername = (name || email.split('@')[0])
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '') // Rimuove caratteri speciali, mantiene solo alfanumerici
                .substring(0, 15); // Limita a 15 caratteri

            console.log('Base username:', baseForUsername);

            // Cerco prima per googleId, poi per email
            let user = await userModel.findOne({ 
                $or: [
                    { googleId },
                    { email: email.toLowerCase() }
                ]
            });

            console.log('User found:', user ? 'YES' : 'NO');

            if (user) {
                console.log('Existing user found, checking googleId...');
                // Se l'utente esiste ma non ha googleId, aggiorniamolo
                if (!user.googleId) {
                    console.log('Adding googleId to existing user...');
                    user.googleId = googleId;
                    user.verified = email_verified;
                    // Assicurati che l'username sia presente anche per gli utenti esistenti
                    if (!user.username) {
                        let generatedUsername = baseForUsername;
                        let counter = 1;
                        while (await userModel.findOne({ username: generatedUsername })) {
                            generatedUsername = `${baseForUsername}${counter}`;
                            counter++;
                        }
                        user.username = generatedUsername;
                    }
                    await user.save();
                    console.log('User updated with googleId');
                }

                console.log('Returning existing user:', user.email);
                // Restituisco l'utente completo invece del token
                return done(null, user);
            }

            console.log('Creating new user...');
            // Se l'utente non esiste, lo creiamo
            // Genera username unico prima di creare il nuovo utente
            let generatedUsername = baseForUsername;
            let counter = 1;
            while (await userModel.findOne({ username: generatedUsername })) {
                generatedUsername = `${baseForUsername}${counter}`;
                counter++;
            }

            const newUser = new userModel({
                name: name, // Usa il nome dal profilo Google
                username: generatedUsername, // Assegna l'username unico generato
                email: email.toLowerCase(),
                googleId,
                verified: email_verified,
            });

            const savedUser = await newUser.save();
            console.log('New user created:', savedUser.email);

            // Restituisco l'utente completo invece del token
            return done(null, savedUser);

        } catch (error) {
            console.error('Errore durante l\'autenticazione Google:', error);
            return done(error);
        }
        console.log('=== GOOGLE STRATEGY END ===');
    }
);

export default googleStrategy;