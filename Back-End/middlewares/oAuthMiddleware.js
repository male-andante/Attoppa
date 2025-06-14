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

            // Normalizza il nome per la generazione dell'username, fallback all'email se il nome non è utile
            const baseForUsername = (name || email.split('@')[0])
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '') // Rimuove caratteri speciali, mantiene solo alfanumerici
                .substring(0, 15); // Limita a 15 caratteri

            // Cerco prima per googleId, poi per email
            let user = await userModel.findOne({ 
                $or: [
                    { googleId },
                    { email: email.toLowerCase() }
                ]
            });

            if (user) {
                // Se l'utente esiste ma non ha googleId, aggiorniamolo
                if (!user.googleId) {
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
                }

                // Genero il token
                const token = jwt.sign({
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin
                }, jwtSecretKey, { expiresIn: '1h' });

                return done(null, { accessToken: token });
            }

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

            // Genero il token
            const token = jwt.sign({
                id: savedUser.id,
                username: savedUser.username,
                name: savedUser.name,
                email: savedUser.email,
                isAdmin: savedUser.isAdmin
            }, jwtSecretKey, { expiresIn: '1h' });

            return done(null, { accessToken: token });

        } catch (error) {
            console.error('Errore durante l\'autenticazione Google:', error);
            return done(error);
        }
    }
);

export default googleStrategy;