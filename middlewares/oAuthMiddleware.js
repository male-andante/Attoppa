import 'dotenv/config';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
const jwtSecretKey = process.env.JWT_SECRET_KEY;

// Import Model
import userModel from "../models/userModel.js"

const googleStrategy = new GoogleStrategy({
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    }, async function(accessToken, refreshToken, profile, done) {
        try{
            // profile è l'oggetto che mi restituisce google con i dati dell'utente loggato
            console.log("PROFILE: ", profile)
            // Destrutturo tutte le informazioni che mi invia google in profile._json
            const {email, name, given_name, family_name, email_verified } = profile._json
            // Cerco nel mio DB se è presente un utente registrato con la mail che mi invia google
            const user = await userModel.findOne({email})
            if(user) {
                // Se presente lo leggo e utilizzo i dati per la creazione del token
                console.log("Utente già presente nel DB")
                // Creo il token JWT 
                const accessToken = jwt.sign({
                    id: user.id,
                    username: user.username,
                    fullname: user.fullname,
                    email: user.email
                }, jwtSecretKey, { expiresIn: '1h' })
                done(null, {accessToken})
            } else {
                // Se NON presente lo salvo nel mio DB e poi genero il token
                // Creo un oggetto userModel con i dati letti da Google
                const newUser = new userModel({
                    username: given_name+family_name,
                    fullname: name,
                    email: email,
                    password: '-',
                    verified: email_verified
                })
                // Salvo il nuovo utente nel mio DB
                const createUser = await newUser.save();
                 // Creo il token JWT 
                const accessToken = jwt.sign({
                    id: createUser.id,
                    username: createUser.username,
                    fullname: createUser.fullname,
                    email: createUser.email
                }, jwtSecretKey, { expiresIn: '1h' })
                done(null, {accessToken})
            }
        } catch(error) {
            done(error)
        }
    }
);

export default googleStrategy;