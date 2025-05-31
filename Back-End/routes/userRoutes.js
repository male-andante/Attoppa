import express from 'express';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

// GET tutti gli utenti (solo admin)
router.get('/', adminMiddleware, async (req, res) => {
    try {
        const users = await userModel.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Errore nel recupero degli utenti:', error);
        res.status(500).json({ message: 'Errore nel recupero degli utenti' });
    }
});

// GET utente per ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // Solo l'admin o l'utente stesso può vedere i dettagli completi
        if (!req.user.isAdmin && req.user.id !== user.id) {
            return res.status(403).json({ message: 'Accesso negato' });
        }

        res.json(user);
    } catch (error) {
        console.error('Errore nel recupero dell\'utente:', error);
        res.status(500).json({ message: 'Errore nel recupero dell\'utente' });
    }
});

// PUT aggiorna utente
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { name, email, password, isAdmin } = req.body;
        const userId = req.params.id;

        // Verifica se l'utente esiste
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // Solo l'admin o l'utente stesso può aggiornare i dati
        if (!req.user.isAdmin && req.user.id !== userId) {
            return res.status(403).json({ message: 'Accesso negato' });
        }

        // Solo l'admin può modificare isAdmin
        if (isAdmin !== undefined && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Non puoi modificare i privilegi di amministratore' });
        }

        // Se si sta cambiando l'email, verifica che non sia già in uso
        if (email && email !== user.email) {
            const existingUser = await userModel.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({ message: 'Email già in uso' });
            }
        }

        // Aggiorna i campi
        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email.toLowerCase();
        if (isAdmin !== undefined && req.user.isAdmin) updates.isAdmin = isAdmin;
        if (password) {
            updates.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'utente:', error);
        res.status(500).json({ message: 'Errore nell\'aggiornamento dell\'utente' });
    }
});

// DELETE utente
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.params.id;

        // Verifica se l'utente esiste
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // Solo l'admin o l'utente stesso può eliminare l'account
        if (!req.user.isAdmin && req.user.id !== userId) {
            return res.status(403).json({ message: 'Accesso negato' });
        }

        await userModel.findByIdAndDelete(userId);

        res.json({ message: 'Utente eliminato con successo' });
    } catch (error) {
        console.error('Errore nell\'eliminazione dell\'utente:', error);
        res.status(500).json({ message: 'Errore nell\'eliminazione dell\'utente' });
    }
});

export default router; 