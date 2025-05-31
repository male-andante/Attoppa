import mongoose from 'mongoose';
import 'dotenv/config';
import userModel from '../models/userModel.js';

async function migrateUsers() {
    try {
        // Connessione al database
        await mongoose.connect(process.env.mongoUrl + process.env.dbName);
        console.log('Connesso al database');

        // Trova tutti gli utenti
        const users = await userModel.find({});
        console.log(`Trovati ${users.length} utenti da migrare`);

        for (const user of users) {
            const updates = {};

            // Se l'utente ha una password fittizia ('-'), rimuoviamola
            if (user.password === '-') {
                updates.password = undefined;
            }

            // Se l'utente non ha un username, generiamolo
            if (!user.username) {
                const baseUsername = user.name.toLowerCase()
                    .replace(/[^a-z0-9]/g, '')
                    .substring(0, 15);
                
                let username = baseUsername;
                let counter = 1;
                
                while (await userModel.findOne({ username })) {
                    username = `${baseUsername}${counter}`;
                    counter++;
                }
                
                updates.username = username;
            }

            // Se l'utente non ha una data di creazione, aggiungiamola
            if (!user.createdAt) {
                updates.createdAt = new Date();
            }

            // Se ci sono aggiornamenti da fare, salviamo l'utente
            if (Object.keys(updates).length > 0) {
                await userModel.findByIdAndUpdate(user._id, updates);
                console.log(`Utente ${user.email} aggiornato`);
            }
        }

        console.log('Migrazione completata con successo');
    } catch (error) {
        console.error('Errore durante la migrazione:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnesso dal database');
    }
}

// Esegui la migrazione
migrateUsers(); 