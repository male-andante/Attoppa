import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Non richiesto per utenti Google
    email: { type: String, required: true, unique: true },
    isAdmin: { type: Boolean, required: true, default: true },
    verified: { type: Boolean, default: false },
    googleId: { type: String, unique: true, sparse: true }, // ID Google, opzionale
    favoriteEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Events' }],
    createdAt: { type: Date, default: Date.now }
})

// Pre-save hook per generare username unico se non fornito
userSchema.pre('save', async function(next) {
    if (!this.username) {
        // Genera username base dal nome
        const baseUsername = this.name.toLowerCase()
            .replace(/[^a-z0-9]/g, '') // Rimuove caratteri speciali
            .substring(0, 15); // Limita a 15 caratteri
        
        let username = baseUsername;
        let counter = 1;
        
        // Cerca un username unico
        while (await mongoose.model('Users').findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }
        
        this.username = username;
    }
    next();
});

const User = mongoose.model('Users', userSchema)

export default User