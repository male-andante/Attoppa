import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Location from '../models/locationModel.js';
import Event from '../models/eventModel.js';
import connectDB from '../connectdb.js';

const addDummyData = async () => {
    try {
        await connectDB();
        console.log('Database connesso per aggiungere dati di esempio.');

        // Pulisci le collezioni esistenti (opzionale, utile per test ripetuti)
        console.log('Pulizia collezioni Locations ed Events...');
        await Location.deleteMany();
        await Event.deleteMany();
        console.log('Pulizia completata.');

        // Dati di esempio per Location
        const dummyLocations = [
            { name: 'Base Milano', address: 'Via Bergognone, 34, Milano MI', coverImage: 'http://example.com/base_milano.jpg', phone: '02 1234567', email: 'info@basemilano.com', website: 'http://www.basemilano.com', description: 'Spazio polifunzionale' },
            { name: 'Fabrique', address: 'Via Fantoli, 9, Milano MI', coverImage: 'http://example.com/fabrique.jpg', phone: '02 9876543', email: 'info@fabrique.it', website: 'http://www.fabrique.it', description: 'Club e spazio eventi' },
            { name: 'Spazio Novecento', address: 'Via Andrea Doria, 36, Roma RM', coverImage: 'http://example.com/spazionovecento.jpg', phone: '06 11223344', email: 'info@spazionovecento.it', website: 'http://www.spazionovecento.it', description: 'Location per eventi a Roma' }
        ];

        // Inserisci Location e ottieni gli ID
        const createdLocations = await Location.insertMany(dummyLocations);
        console.log(`${createdLocations.length} Location di esempio create.`);

        // Dati di esempio per Eventi (usando gli ID delle Location create)
        const dummyEvents = [
            {
                name: 'Techno Night',
                location: createdLocations[0]._id, // Riferimento a Base Milano
                coverImage: 'http://example.com/techno_night.jpg',
                description: 'Una notte all\'insegna della techno.',
                startDate: new Date(),
                endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Domani
                startTime: '23:00',
                endTime: '05:00',
                price: 15,
                isFree: false,
                isOnline: false
            },
            {
                name: 'Electro Live Set',
                location: createdLocations[1]._id, // Riferimento a Fabrique
                coverImage: 'http://example.com/electro_live.jpg',
                description: 'Live set di artisti emergenti.',
                startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Tra una settimana
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 ore dopo
                startTime: '21:00',
                endTime: '00:00',
                price: 10,
                isFree: false,
                isOnline: false
            },
             {
                name: 'Minimal Gathering',
                location: createdLocations[2]._id, // Riferimento a Spazio Novecento
                coverImage: 'http://example.com/minimal_gathering.jpg',
                description: 'Appuntamento con la musica minimal.',
                startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Tra due settimane
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 ore dopo
                startTime: '22:00',
                endTime: '02:00',
                price: 0,
                isFree: true,
                isOnline: false
            }
        ];

        // Inserisci Eventi
        const createdEvents = await Event.insertMany(dummyEvents);
        console.log(`${createdEvents.length} Eventi di esempio creati.`);

        console.log('Aggiunta dati di esempio completata con successo.');

    } catch (error) {
        console.error('Errore durante l\'aggiunta dei dati di esempio:', error);
    } finally {
        mongoose.connection.close();
        console.log('Connessione al database chiusa.');
    }
};

addDummyData(); 