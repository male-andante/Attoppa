import express from 'express'
import Location from "../models/locationModel.js"
import Event from "../models/eventModel.js"

const locationRouter = express.Router()

// Funzioni di validazione
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

const validatePhone = (phone) => {
    // Formato italiano: +39 XXX XXX XXXX o 3XX XXX XXXX
    const phoneRegex = /^(\+39\s?)?\d{3}\s?\d{3}\s?\d{4}$/
    return phoneRegex.test(phone)
}

const validateWebsite = (website) => {
    try {
        new URL(website)
        return true
    } catch {
        return false
    }
}

//GET All
locationRouter.get('/', async (req, res) => {
    try {
        const locations = await Location.find()
        res.status(200).json(locations)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//GET Location Id
locationRouter.get('/:id', async (req, res) => {
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

//GET tutti gli eventi per una location
locationRouter.get('/:id/events', async (req, res) => {
    const id = req.params.id;
    try {
        const events = await Event.find({ location: id });
        console.log('Eventi recuperati per la location', id, ':', events);
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//POST
locationRouter.post('/', async (req, res) => {
    try {
        const locationData = req.body

        // Validazioni
        if (!validateEmail(locationData.email)) {
            return res.status(400).json({ message: "Email non valida" })
        }

        if (!validatePhone(locationData.phone)) {
            return res.status(400).json({ message: "Numero di telefono non valido" })
        }

        if (locationData.website && !validateWebsite(locationData.website)) {
            return res.status(400).json({ message: "URL del sito web non valido" })
        }

        // Verifica se l'email esiste già
        const existingLocation = await Location.findOne({ email: locationData.email.toLowerCase() })
        if (existingLocation) {
            return res.status(400).json({ message: "Email già registrata" })
        }

        // Verifica se il telefono esiste già
        const existingPhone = await Location.findOne({ phone: locationData.phone })
        if (existingPhone) {
            return res.status(400).json({ message: "Numero di telefono già registrato" })
        }

        // Manipolazioni
        locationData.email = locationData.email.toLowerCase().trim()
        locationData.name = locationData.name.trim()
        locationData.address = locationData.address.trim()
        if (locationData.website) {
            locationData.website = locationData.website.trim()
        }
        if (locationData.description) {
            locationData.description = locationData.description.trim()
        }

        const location = new Location(locationData)
        const dbLocation = await location.save()
        res.status(201).json(dbLocation)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//PUT
locationRouter.put('/:id', async (req, res) => {
    const id = req.params.id
    try {
        const locationData = req.body

        // Validazioni
        if (locationData.email && !validateEmail(locationData.email)) {
            return res.status(400).json({ message: "Email non valida" })
        }

        if (locationData.phone && !validatePhone(locationData.phone)) {
            return res.status(400).json({ message: "Numero di telefono non valido" })
        }

        if (locationData.website && !validateWebsite(locationData.website)) {
            return res.status(400).json({ message: "URL del sito web non valido" })
        }

        // Se l'email viene modificata, verifica che non esista già
        if (locationData.email) {
            const existingLocation = await Location.findOne({ 
                email: locationData.email.toLowerCase(),
                _id: { $ne: id }
            })
            if (existingLocation) {
                return res.status(400).json({ message: "Email già registrata" })
            }
        }

        // Se il telefono viene modificato, verifica che non esista già
        if (locationData.phone) {
            const existingPhone = await Location.findOne({ 
                phone: locationData.phone,
                _id: { $ne: id }
            })
            if (existingPhone) {
                return res.status(400).json({ message: "Numero di telefono già registrato" })
            }
        }

        // Manipolazioni
        if (locationData.email) locationData.email = locationData.email.toLowerCase().trim()
        if (locationData.name) locationData.name = locationData.name.trim()
        if (locationData.address) locationData.address = locationData.address.trim()
        if (locationData.website) locationData.website = locationData.website.trim()
        if (locationData.description) locationData.description = locationData.description.trim()

        const locationUpdate = await Location.findByIdAndUpdate(id, locationData, { new: true })
        if (!locationUpdate) {
            return res.status(404).json({ message: "Location non trovata" })
        }
        res.status(200).json(locationUpdate)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//DELETE
locationRouter.delete('/:id', async (req, res) => {
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

export default locationRouter

