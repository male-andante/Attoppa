import mongoose from 'mongoose';
import 'dotenv/config';
import userModel from '../models/userModel.js';

const makeUserAdmin = async (email) => {
    try {
        await mongoose.connect(process.env.mongoUrl);
        console.log('✅ Connesso al database');

        const user = await userModel.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            console.log('❌ Utente non trovato');
            return;
        }

        user.isAdmin = true;
        await user.save();
        
        console.log(`✅ Utente ${email} promosso ad admin`);
        console.log('Dati utente:', {
            name: user.name,
            email: user.email,
            username: user.username,
            isAdmin: user.isAdmin
        });
        
    } catch (error) {
        console.error('❌ Errore:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnesso dal database');
    }
};

// Esempio di utilizzo
const email = process.argv[2];
if (!email) {
    console.log('❌ Fornisci un email come parametro');
    console.log('Esempio: node makeAdmin.js user@example.com');
    process.exit(1);
}

makeUserAdmin(email); 