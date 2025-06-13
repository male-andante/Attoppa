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
            const newUser = new userModel({
                name: name,
                email: email.toLowerCase(),
                googleId,
                verified: email_verified,
                // username verrà generato automaticamente dal pre-save hook
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