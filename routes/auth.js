// Importo le dipendenze necessario per il progetto
import express from 'express';
import router from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
const saltRounds = +process.env.SALT_ROUNDS;
const jwtSecretKey = process.env.JWT_SECRET_KEY;

// Import Model
import userModel from "../models/userModel.js"

const authRouter = express.Router()

// Ogg che invierà il client tramite una chiamata ajax
/* {
    "fullname" : "John Smith",
    "username" : "johnsmith",
    "email" : "johnsmith@example.com",
    "password" : "Pa$$w0rd!",
    "verified" : false
} */

// Auth Routes
authRouter.post('/auth/register', async(req, res) => {
    // Logica per la registrazione di un utente
    /* const obj = req.body;
    const user = new userModel(obj)
    const userSave = await user.save()
    return res.status(201).json(userSave) */

    const password = req.body.password;

    // Store hash in your password DB.
    const user = new userModel({
        ...req.body,
        password: await bcrypt.hash(password, saltRounds)
    })
    const userSaved = await user.save()
    return res.status(201).json(userSaved)

})

// Ogg che invierà il client tramite una chiamata ajax
/* {
    "username" : "johnsmith",
    "password" : "Pa$$w0rd!",
} */

authRouter.post('/auth/login', async(req, res) => {
    // Logica per il login di un utente
    const username = req.body.username
    const password = req.body.password

    const userLogin = await userModel.findOne({username: username})
    console.log(userLogin)
    if(userLogin) {
        // Lo username è stato trovato nel DB
        // Controllo la password
        const loginPassword = await bcrypt.compare(password, userLogin.password)
        if(loginPassword) {
            // La password è corretta
            // Genero un Token JWT
            
            // Soluzione 1
            const token = jwt.sign(
                {
                    id: userLogin.id,
                    username: userLogin.username,
                    fullname: userLogin.fullname,
                    email: userLogin.email
                }
                , jwtSecretKey, { expiresIn: '1h' });

            return res.status(200).json(token)
        } else {
            // La password è errata
            return res.status(400).json({message: 'Invalid Password!!'})
        }
    } else {
        // Lo username non è stato trovato nel DB
        return res.status(400).json({message: 'Invalid Username!!'})
    }

})



// Export Router
export default authRouter;