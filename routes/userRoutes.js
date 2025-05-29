import express from 'express'
import User from "../models/userModel.js"

const userRouter = express.Router()

//GET All
userRouter.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json(users)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//GET User Id
userRouter.get('/:id', async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findById(id)
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
        const user = new User(req.body)
        const dbUser = await user.save()
        res.status(201).json(dbUser)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//PUT
userRouter.put('/:id', async (req, res) => {
    const id = req.params.id
    try {
        const userUpdate = await User.findByIdAndUpdate(id, req.body, { new: true })
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