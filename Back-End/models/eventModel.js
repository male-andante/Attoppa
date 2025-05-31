import mongoose from "mongoose"

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Locations' },
    coverImage: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    email: { type: String, required: false, unique: true },
    website: { type: String, required: false, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    price: { type: Number, required: true },
    isFree: { type: Boolean, required: true, default: false },
    isOnline: { type: Boolean, required: true, default: false },
})

const Event = mongoose.model('Events', eventSchema)

export default Event


/* Creare un evento
const event = new Event({
    name: "Concerto Jazz",
    location: "ID_DELLA_LOCATION", // Questo deve essere un ObjectId valido
    // ... altri campi
});

// Recuperare un evento con i dettagli della location
const eventWithLocation = await Event.findById(eventId).populate('location');
// Ora eventWithLocation.location conterrà tutti i dettagli della location */