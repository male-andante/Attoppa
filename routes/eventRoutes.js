import express from 'express'
import Event from "../models/eventModel.js"

const eventRouter = express.Router()

//GET All
eventRouter.get('/', async (req, res) => {
    try {
        const events = await Event.find()
        res.status(200).json(events)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//GET Event Id
eventRouter.get('/:id', async (req, res) => {
    const id = req.params.id
    try {
        const event = await Event.findById(id)
        if (!event) {
            return res.status(404).json({ message: "Evento non trovato" })
        }
        res.status(200).json(event)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//POST
eventRouter.post('/', async (req, res) => {
    try {
        const event = new Event(req.body)
        const dbEvent = await event.save()
        res.status(201).json(dbEvent)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//PUT
eventRouter.put('/:id', async (req, res) => {
    const id = req.params.id
    try {
        const eventUpdate = await Event.findByIdAndUpdate(id, req.body, { new: true })
        if (!eventUpdate) {
            return res.status(404).json({ message: "Evento non trovato" })
        }
        res.status(200).json(eventUpdate)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//DELETE
eventRouter.delete('/:id', async (req, res) => {
    const id = req.params.id
    try {
        const deletedEvent = await Event.findByIdAndDelete(id)
        if (!deletedEvent) {
            return res.status(404).json({ message: "Evento non trovato" })
        }
        res.status(200).json({ message: 'Evento cancellato con successo' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default eventRouter