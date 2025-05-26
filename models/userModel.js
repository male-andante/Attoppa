import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    isAdmin: { type: Boolean, required: true, default: false }
})  // così definisco che forma deve avere l'utente.

const User = mongoose.model('Users', userSchema)

export default User