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
            },
            // --- 10 nuovi eventi ---
            {
                name: 'Deep House Experience',
                location: createdLocations[0]._id,
                coverImage: 'http://example.com/deep_house.jpg',
                description: 'Esperienza immersiva deep house.',
                startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
                startTime: '22:00',
                endTime: '03:00',
                price: 12,
                isFree: false,
                isOnline: false
            },
            {
                name: 'Sunrise Techno',
                location: createdLocations[1]._id,
                coverImage: 'http://example.com/sunrise_techno.jpg',
                description: 'Techno all\'alba con DJ internazionali.',
                startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
                startTime: '04:00',
                endTime: '10:00',
                price: 18,
                isFree: false,
                isOnline: false
            },
            {
                name: 'Open Air Minimal',
                location: createdLocations[2]._id,
                coverImage: 'http://example.com/open_air_minimal.jpg',
                description: 'Minimal open air nel cuore di Roma.',
                startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
                startTime: '18:00',
                endTime: '22:00',
                price: 8,
                isFree: false,
                isOnline: false
            },
            {
                name: 'Classic Techno Night',
                location: createdLocations[0]._id,
                coverImage: 'http://example.com/classic_techno.jpg',
                description: 'Classici della techno tutta la notte.',
                startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000),
                startTime: '23:00',
                endTime: '06:00',
                price: 20,
                isFree: false,
                isOnline: false
            },
            {
                name: 'Techno Aperitivo',
                location: createdLocations[1]._id,
                coverImage: 'http://example.com/techno_aperitivo.jpg',
                description: 'Aperitivo con selezione techno.',
                startDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
                startTime: '19:00',
                endTime: '21:00',
                price: 5,
                isFree: false,
                isOnline: false
            },
            {
                name: 'Roma Minimal Fest',
                location: createdLocations[2]._id,
                coverImage: 'http://example.com/roma_minimal_fest.jpg',
                description: 'Festival minimal con artisti locali.',
                startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
                startTime: '16:00',
                endTime: '00:00',
                price: 0,
                isFree: true,
                isOnline: false
            },
            {
                name: 'Techno Marathon',
                location: createdLocations[0]._id,
                coverImage: 'http://example.com/techno_marathon.jpg',
                description: '12 ore di techno no-stop.',
                startDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
                startTime: '18:00',
                endTime: '06:00',
                price: 25,
                isFree: false,
                isOnline: false
            },
            {
                name: 'Minimal Sunset',
                location: createdLocations[1]._id,
                coverImage: 'http://example.com/minimal_sunset.jpg',
                description: 'Minimal e tramonto in terrazza.',
                startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
                startTime: '19:30',
                endTime: '22:30',
                price: 7,
                isFree: false,
                isOnline: false
            },
            {
                name: 'Techno Brunch',
                location: createdLocations[2]._id,
                coverImage: 'http://example.com/techno_brunch.jpg',
                description: 'Brunch domenicale con musica techno.',
                startDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
                startTime: '12:00',
                endTime: '16:00',
                price: 10,
                isFree: false,
                isOnline: false
            },
            {
                name: 'After Minimal',
                location: createdLocations[0]._id,
                coverImage: 'http://example.com/after_minimal.jpg',
                description: 'After party minimal fino al mattino.',
                startDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
                startTime: '04:00',
                endTime: '10:00',
                price: 8,
                isFree: false,
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