import express from 'express'
import Location from "../models/locationModel.js"

const locationsRouter = express.Router()

//GET All
locationsRouter.get('/', async (req, res) => {
    try {
        const locations = await Location.find()
        res.status(200).json(locations)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//GET Location Id
locationsRouter.get('/:id', async (req, res) => {
    const id = req.params.id
    try {
        const location = await Location.findById(id)
        if (!location) {
            return res.status(404).json({ message: "Location non trovata" })
        }
        res.status(200).json(location)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//POST
locationsRouter.post('/', async (req, res) => {
    try {
        const location = new Location(req.body)
        const dbLocation = await location.save()
        res.status(201).json(dbLocation)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//PUT
locationsRouter.put('/:id', async (req, res) => {
    const id = req.params.id
    try {
        const locationUpdate = await Location.findByIdAndUpdate(id, req.body, { new: true })
        if (!locationUpdate) {
            return res.status(404).json({ message: "Location non trovata" })
        }
        res.status(200).json(locationUpdate)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//DELETE
locationsRouter.delete('/:id', async (req, res) => {
    const id = req.params.id
    try {
        const deletedLocation = await Location.findByIdAndDelete(id)
        if (!deletedLocation) {
            return res.status(404).json({ message: "Location non trovata" })
        }
        res.status(200).json({ message: 'Location cancellata con successo' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default locationsRouter

