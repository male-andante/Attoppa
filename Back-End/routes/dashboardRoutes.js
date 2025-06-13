import express from 'express';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import Event from '../models/eventModel.js';
import Location from '../models/locationModel.js';
import User from '../models/userModel.js';

const adminRouter = express.Router();

// Middleware per proteggere tutte le route della dashboard
adminRouter.use(adminMiddleware);

// Funzioni di validazione
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhone = (phone) => {
    const phoneRegex = /^(\+39|0039)?\s?3\d{2}\s?\d{6,7}$/;
    return phoneRegex.test(phone);
};

const validateWebsite = (website) => {
    try {
        new URL(website);
        return true;
    } catch {
        return false;
    }
};

const validateTime = (time) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
};

// GET - Dashboard Home (statistiche) NON SERVE
adminRouter.get('/stats', async (req, res) => {
    try {
        const totalEvents = await Event.countDocuments();
        const totalLocations = await Location.countDocuments();
        const totalUsers = await User.countDocuments();
        const recentEvents = await Event.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('location');
        const recentLocations = await Location.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            stats: {
                totalEvents,
                totalLocations,
                totalUsers
            },
            recentEvents,
            recentLocations
        });
    } catch (error) {
        console.error('Errore nel recupero delle statistiche:', error);
        res.status(500).json({ message: 'Errore nel recupero delle statistiche' });
    }
});

// GET - Lista utenti (con paginazione)
adminRouter.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments();

        res.json({
            users,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalUsers: total
        });
    } catch (error) {
        console.error('Errore nel recupero degli utenti:', error);
        res.status(500).json({ message: 'Errore nel recupero degli utenti' });
    }
});

// PUT - Modifica ruolo utente NON SERVE
adminRouter.put('/users/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { isAdmin } = req.body;

        // Impedisce di modificare il proprio ruolo
        if (id === req.user.id) {
            return res.status(400).json({ message: 'Non puoi modificare il tuo ruolo' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { isAdmin },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        res.json(user);
    } catch (error) {
        console.error('Errore nella modifica del ruolo:', error);
        res.status(500).json({ message: 'Errore nella modifica del ruolo' });
    }
});

// DELETE - Elimina utente NON SERVE
adminRouter.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Impedisce di eliminare se stessi
        if (id === req.user.id) {
            return res.status(400).json({ message: 'Non puoi eliminare il tuo account' });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        res.json({ message: 'Utente eliminato con successo' });
    } catch (error) {
        console.error('Errore nell\'eliminazione dell\'utente:', error);
        res.status(500).json({ message: 'Errore nell\'eliminazione dell\'utente' });
    }
});

// GET - Eventi in attesa di approvazione NON SERVE
adminRouter.get('/events/pending', async (req, res) => {
    try {
        const events = await Event.find({ isApproved: false })
            .populate('location')
            .sort({ createdAt: -1 });

        res.json(events);
    } catch (error) {
        console.error('Errore nel recupero degli eventi in attesa:', error);
        res.status(500).json({ message: 'Errore nel recupero degli eventi in attesa' });
    }
});

// PUT - Approva evento NON SERVE
adminRouter.put('/events/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findByIdAndUpdate(
            id,
            { isApproved: true },
            { new: true }
        ).populate('location');

        if (!event) {
            return res.status(404).json({ message: 'Evento non trovato' });
        }

        res.json(event);
    } catch (error) {
        console.error('Errore nell\'approvazione dell\'evento:', error);
        res.status(500).json({ message: 'Errore nell\'approvazione dell\'evento' });
    }
});

// GET - Locations in attesa di approvazione NON SERVE
adminRouter.get('/locations/pending', async (req, res) => {
    try {
        const locations = await Location.find({ isApproved: false })
            .sort({ createdAt: -1 });

        res.json(locations);
    } catch (error) {
        console.error('Errore nel recupero delle locations in attesa:', error);
        res.status(500).json({ message: 'Errore nel recupero delle locations in attesa' });
    }
});

// PUT - Approva location
adminRouter.put('/locations/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const location = await Location.findByIdAndUpdate(
            id,
            { isApproved: true },
            { new: true }
        );

        if (!location) {
            return res.status(404).json({ message: 'Location non trovata' });
        }

        res.json(location);
    } catch (error) {
        console.error('Errore nell\'approvazione della location:', error);
        res.status(500).json({ message: 'Errore nell\'approvazione della location' });
    }
});

// POST - Inserimento nuova location
adminRouter.post('/locations', async (req, res) => {
    try {
        const { name, address, city, email, phone, website, description } = req.body;

        // Validazioni
        if (!name || !address || !city) {
            return res.status(400).json({ message: 'Nome, indirizzo e città sono obbligatori' });
        }

        if (email && !validateEmail(email)) {
            return res.status(400).json({ message: 'Formato email non valido' });
        }

        if (phone && !validatePhone(phone)) {
            return res.status(400).json({ message: 'Formato numero di telefono non valido' });
        }

        if (website && !validateWebsite(website)) {
            return res.status(400).json({ message: 'Formato URL non valido' });
        }

        // Verifica se esiste già una location con lo stesso nome nella stessa città
        const existingLocation = await Location.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            city: { $regex: new RegExp(`^${city}$`, 'i') }
        });

        if (existingLocation) {
            return res.status(400).json({ 
                message: 'Esiste già una location con questo nome in questa città' 
            });
        }

        // Creazione nuova location
        const location = new Location({
            name: name.trim(),
            address: address.trim(),
            city: city.trim(),
            email: email?.trim().toLowerCase(),
            phone: phone?.trim(),
            website: website?.trim(),
            description: description?.trim(),
            isApproved: true // Le location inserite dall'admin sono automaticamente approvate
        });

        const savedLocation = await location.save();
        res.status(201).json(savedLocation);

    } catch (error) {
        console.error('Errore nell\'inserimento della location:', error);
        res.status(500).json({ message: 'Errore nell\'inserimento della location' });
    }
});

// POST - Inserimento nuovo evento
adminRouter.post('/events', async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            startTime,
            endTime,
            location,
            price,
            email,
            website,
            maxParticipants
        } = req.body;

        // Validazioni base
        if (!title || !date || !startTime || !endTime || !location) {
            return res.status(400).json({ 
                message: 'Titolo, data, orari e location sono obbligatori' 
            });
        }

        // Validazione email e website
        if (email && !validateEmail(email)) {
            return res.status(400).json({ message: 'Formato email non valido' });
        }

        if (website && !validateWebsite(website)) {
            return res.status(400).json({ message: 'Formato URL non valido' });
        }

        // Validazione orari
        if (!validateTime(startTime) || !validateTime(endTime)) {
            return res.status(400).json({ message: 'Formato orario non valido (HH:mm)' });
        }

        if (startTime >= endTime) {
            return res.status(400).json({ 
                message: 'L\'orario di fine deve essere successivo all\'orario di inizio' 
            });
        }

        // Validazione data
        const eventDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate < today) {
            return res.status(400).json({ 
                message: 'La data dell\'evento non può essere nel passato' 
            });
        }

        // Validazione prezzo
        if (price !== undefined && price !== null) {
            if (typeof price !== 'number' || price < 0) {
                return res.status(400).json({ 
                    message: 'Il prezzo deve essere un numero positivo' 
                });
            }
        }

        // Verifica esistenza location
        const locationExists = await Location.findById(location);
        if (!locationExists) {
            return res.status(404).json({ message: 'Location non trovata' });
        }

        // Verifica se esiste già un evento con lo stesso titolo nella stessa data e location
        const existingEvent = await Event.findOne({
            title: { $regex: new RegExp(`^${title}$`, 'i') },
            date,
            location
        });

        if (existingEvent) {
            return res.status(400).json({ 
                message: 'Esiste già un evento con questo titolo in questa data e location' 
            });
        }

        // Creazione nuovo evento
        const event = new Event({
            title: title.trim(),
            description: description?.trim(),
            date,
            startTime,
            endTime,
            location,
            price: price || 0,
            email: email?.trim().toLowerCase(),
            website: website?.trim(),
            maxParticipants: maxParticipants || null,
            isApproved: true // Gli eventi inseriti dall'admin sono automaticamente approvati
        });

        const savedEvent = await event.save();
        const populatedEvent = await Event.findById(savedEvent._id).populate('location');
        res.status(201).json(populatedEvent);

    } catch (error) {
        console.error('Errore nell\'inserimento dell\'evento:', error);
        res.status(500).json({ message: 'Errore nell\'inserimento dell\'evento' });
    }
});

// GET - Lista locations (per il form di inserimento evento)
adminRouter.get('/locations', async (req, res) => {
    try {
        const locations = await Location.find({ isApproved: true })
            .select('name city address')
            .sort({ name: 1 });
        res.json(locations);
    } catch (error) {
        console.error('Errore nel recupero delle locations:', error);
        res.status(500).json({ message: 'Errore nel recupero delle locations' });
    }
});

export default adminRouter;


/*
POST /dashboard/locations
{
    "name": "Teatro Comunale",
    "address": "Via Roma 123",
    "city": "Milano",
    "email": "info@teatrocomunale.it",
    "phone": "+39 333 1234567",
    "website": "https://www.teatrocomunale.it",
    "description": "Teatro storico nel centro città"
}*/

/*
POST /dashboard/events
{
    "title": "Concerto Jazz",
    "description": "Serata di jazz con artisti internazionali",
    "date": "2024-04-15",
    "startTime": "20:00",
    "endTime": "23:00",
    "location": "ID_DELLA_LOCATION",
    "price": 25.00,
    "email": "eventi@teatrocomunale.it",
    "website": "https://www.teatrocomunale.it/concerto-jazz",
    "maxParticipants": 200
}
 */