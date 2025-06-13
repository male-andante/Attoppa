import express from 'express'
import User from "../models/userModel.js"
import bcrypt from 'bcrypt'

const userRouter = express.Router()

// Funzioni di validazione
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

const validatePassword = (password) => {
    // Minimo 8 caratteri, almeno una lettera maiuscola, una minuscola e un numero
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
    return passwordRegex.test(password)
}

//GET All
userRouter.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password') // Escludo la password dalla risposta
        res.status(200).json(users)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//GET User Id
userRouter.get('/:id', async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findById(id).select('-password')
        if (!user) {
            return res.status(404).json({ message: "Utente non trovato" })
        }
        res.status(200).json(user)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//POST
userRouter.post('/', async (req, res) => {
    try {
        const userData = req.body

        // Validazioni
        if (!validateEmail(userData.email)) {
            return res.status(400).json({ message: "Email non valida" })
        }

        if (!validatePassword(userData.password)) {
            return res.status(400).json({ 
                message: "La password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola e un numero" 
            })
        }

        // Verifica se l'email esiste già
        const existingUser = await User.findOne({ email: userData.email.toLowerCase() })
        if (existingUser) {
            return res.status(400).json({ message: "Email già registrata" })
        }

        // Manipolazioni
        userData.email = userData.email.toLowerCase().trim()
        userData.name = userData.name.trim()
        userData.username = userData.username.trim()

        // Hash della password
        const salt = await bcrypt.genSalt(10)
        userData.password = await bcrypt.hash(userData.password, salt)

        const user = new User(userData)
        const dbUser = await user.save()
        
        // Rimuovo la password dalla risposta
        const userResponse = dbUser.toObject()
        delete userResponse.password
        
        res.status(201).json(userResponse)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//PUT
userRouter.put('/:id', async (req, res) => {
    const id = req.params.id
    try {
        const userData = req.body

        // Validazioni
        if (userData.email && !validateEmail(userData.email)) {
            return res.status(400).json({ message: "Email non valida" })
        }

        if (userData.password && !validatePassword(userData.password)) {
            return res.status(400).json({ 
                message: "La password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola e un numero" 
            })
        }

        // Se l'email viene modificata, verifica che non esista già
        if (userData.email) {
            const existingUser = await User.findOne({ 
                email: userData.email.toLowerCase(),
                _id: { $ne: id } // Esclude l'utente corrente
            })
            if (existingUser) {
                return res.status(400).json({ message: "Email già registrata" })
            }
        }

        // Manipolazioni
        if (userData.email) userData.email = userData.email.toLowerCase().trim()
        if (userData.name) userData.name = userData.name.trim()
        if (userData.username) userData.username = userData.username.trim()

        // Se la password viene modificata, la hasha
        if (userData.password) {
            const salt = await bcrypt.genSalt(10)
            userData.password = await bcrypt.hash(userData.password, salt)
        }

        const userUpdate = await User.findByIdAndUpdate(id, userData, { new: true }).select('-password')
        if (!userUpdate) {
            return res.status(404).json({ message: "Utente non trovato" })
        }
        res.status(200).json(userUpdate)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//DELETE
userRouter.delete('/:id', async (req, res) => {
    const id = req.params.id
    try {
        const deletedUser = await User.findByIdAndDelete(id)
        if (!deletedUser) {
            return res.status(404).json({ message: "Utente non trovato" })
        }
        res.status(200).json({ message: 'Utente cancellato con successo' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default userRouter