import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/userModel.js';
import connectDB from '../connectdb.js';

const makeAllUsersAdmin = async () => {
    try {
        await connectDB();
        console.log('Database connesso. Aggiornamento utenti...');
        const result = await User.updateMany({}, { isAdmin: true });
        console.log(`Utenti aggiornati: ${result.modifiedCount}`);
    } catch (error) {
        console.error('Errore durante l\'aggiornamento degli utenti:', error);
    } finally {
        mongoose.connection.close();
        console.log('Connessione al database chiusa.');
    }
};

makeAllUsersAdmin(); 