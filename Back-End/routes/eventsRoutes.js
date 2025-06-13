import express from 'express'
import Event from "../models/eventModel.js"
import Location from "../models/locationModel.js"
import authMiddleware from '../middlewares/authMiddleware.js'

const eventRouter = express.Router()

// Funzioni di validazione
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

const validateWebsite = (website) => {
    try {
        new URL(website)
        return true
    } catch {
        return false
    }
}

const validateTime = (time) => {
    // Formato HH:mm
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
}

const isTimeAfter = (time1, time2) => {
    const [hours1, minutes1] = time1.split(':').map(Number)
    const [hours2, minutes2] = time2.split(':').map(Number)
    return hours1 > hours2 || (hours1 === hours2 && minutes1 > minutes2)
}

//GET All (Ora restituisce sempre tutti gli eventi)
eventRouter.get('/', async (req, res) => {
    try {
        const events = await Event.find().populate('location')
        res.status(200).json(events)
    } catch (err) {
        console.error('Errore nel recupero di tutti gli eventi:', err);
        res.status(500).json({ error: err.message })
    }
})

//GET Event Id
eventRouter.get('/:id', async (req, res) => {
    const id = req.params.id
    try {
        const event = await Event.findById(id).populate('location')
        if (!event) {
            return res.status(404).json({ message: "Evento non trovato" })
        }
        res.status(200).json(event)
    } catch (err) {
        console.error('Errore nel recupero evento per ID:', err);
        res.status(500).json({ error: err.message })
    }
})

// GET eventi a cui l'utente è interessato
eventRouter.get('/interested', authMiddleware, async (req, res) => {
    try {
        // L'ID dell'utente autenticato è disponibile in req.user._id grazie a authMiddleware
        const userId = req.user._id;
        const interestedEvents = await Event.find({ interestedUsers: userId }).populate('location');
        res.status(200).json(interestedEvents);
    } catch (err) {
        console.error('Errore nel recupero degli eventi interessati:', err);
        res.status(500).json({ error: err.message });
    }
});

//POST
eventRouter.post('/', async (req, res) => {
    try {
        const eventData = req.body

        // Validazioni
        if (!validateTime(eventData.startTime) || !validateTime(eventData.endTime)) {
            return res.status(400).json({ message: "Formato orario non valido (usare HH:mm)" })
        }

        if (!isTimeAfter(eventData.endTime, eventData.startTime)) {
            return res.status(400).json({ message: "L'orario di fine deve essere successivo all'orario di inizio" })
        }

        if (new Date(eventData.endDate) <= new Date(eventData.startDate)) {
            return res.status(400).json({ message: "La data di fine deve essere successiva alla data di inizio" })
        }

        if (eventData.email && !validateEmail(eventData.email)) {
            return res.status(400).json({ message: "Email non valida" })
        }

        if (eventData.website && !validateWebsite(eventData.website)) {
            return res.status(400).json({ message: "URL del sito web non valido" })
        }

        if (eventData.price < 0) {
            return res.status(400).json({ message: "Il prezzo non può essere negativo" })
        }

        if (eventData.isFree && eventData.price !== 0) {
            return res.status(400).json({ message: "Se l'evento è gratuito, il prezzo deve essere 0" })
        }

        // Verifica che la location esista
        const location = await Location.findById(eventData.location)
        if (!location) {
            return res.status(400).json({ message: "Location non trovata" })
        }

        // Verifica se l'email esiste già (se fornita)
        if (eventData.email) {
            const existingEvent = await Event.findOne({ email: eventData.email.toLowerCase() })
            if (existingEvent) {
                return res.status(400).json({ message: "Email già registrata" })
            }
        }

        // Verifica se il sito web esiste già (se fornito)
        if (eventData.website) {
            const existingEvent = await Event.findOne({ website: eventData.website })
            if (existingEvent) {
                return res.status(400).json({ message: "Sito web già registrato" })
            }
        }

        // Manipolazioni
        eventData.name = eventData.name.trim()
        eventData.description = eventData.description.trim()
        if (eventData.email) eventData.email = eventData.email.toLowerCase().trim()
        if (eventData.website) eventData.website = eventData.website.trim()

        const event = new Event(eventData)
        const dbEvent = await event.save()
        const populatedEvent = await Event.findById(dbEvent._id).populate('location')
        res.status(201).json(populatedEvent)
    } catch (err) {
        console.error('Errore nella creazione dell\'evento:', err);
        res.status(500).json({ error: err.message })
    }
})

//PUT
eventRouter.put('/:id', async (req, res) => {
    const id = req.params.id
    try {
        const eventData = req.body

        // Validazioni
        if (eventData.startTime && eventData.endTime) {
            if (!validateTime(eventData.startTime) || !validateTime(eventData.endTime)) {
                return res.status(400).json({ message: "Formato orario non valido (usare HH:mm)" })
            }
            if (!isTimeAfter(eventData.endTime, eventData.startTime)) {
                return res.status(400).json({ message: "L'orario di fine deve essere successivo all'orario di inizio" })
            }
        }

        if (eventData.startDate && eventData.endDate) {
            if (new Date(eventData.endDate) <= new Date(eventData.startDate)) {
                return res.status(400).json({ message: "La data di fine deve essere successiva alla data di inizio" })
            }
        }

        if (eventData.email && !validateEmail(eventData.email)) {
            return res.status(400).json({ message: "Email non valida" })
        }

        if (eventData.website && !validateWebsite(eventData.website)) {
            return res.status(400).json({ message: "URL del sito web non valido" })
        }

        if (eventData.price !== undefined && eventData.price < 0) {
            return res.status(400).json({ message: "Il prezzo non può essere negativo" })
        }

        if (eventData.isFree && eventData.price !== 0) {
            return res.status(400).json({ message: "Se l'evento è gratuito, il prezzo deve essere 0" })
        }

        // Verifica che la location esista (se fornita)
        if (eventData.location) {
            const location = await Location.findById(eventData.location)
            if (!location) {
                return res.status(400).json({ message: "Location non trovata" })
            }
        }

        // Se l'email viene modificata, verifica che non esista già
        if (eventData.email) {
            const existingEvent = await Event.findOne({ 
                email: eventData.email.toLowerCase(),
                _id: { $ne: id }
            })
            if (existingEvent) {
                return res.status(400).json({ message: "Email già registrata" })
            }
        }

        // Se il sito web viene modificato, verifica che non esista già
        if (eventData.website) {
            const existingEvent = await Event.findOne({ 
                website: eventData.website,
                _id: { $ne: id }
            })
            if (existingEvent) {
                return res.status(400).json({ message: "Sito web già registrato" })
            }
        }

        // Manipolazioni
        if (eventData.name) eventData.name = eventData.name.trim()
        if (eventData.description) eventData.description = eventData.description.trim()
        if (eventData.email) eventData.email = eventData.email.toLowerCase().trim()
        if (eventData.website) eventData.website = eventData.website.trim()

        const eventUpdate = await Event.findByIdAndUpdate(id, eventData, { new: true }).populate('location')
        if (!eventUpdate) {
            return res.status(404).json({ message: "Evento non trovato" })
        }
        res.status(200).json(eventUpdate)
    } catch (err) {
        console.error('Errore nell\'aggiornamento dell\'evento:', err);
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
        console.error('Errore nell\'eliminazione dell\'evento:', err);
        res.status(500).json({ error: err.message })
    }
})

export default eventRouter