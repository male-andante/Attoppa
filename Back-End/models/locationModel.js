import mongoose from "mongoose"

const locationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    coverImage: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    website: { type: String, required: false, unique: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true }
})

const Location = mongoose.model('Locations', locationSchema)

export default Location