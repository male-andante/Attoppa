import express from 'express'
import cors from 'cors'
import "dotenv/config"
import connectDB from './connectdb.js'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import {CloudinaryStorage} from "multer-storage-cloudinary"
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import googleStrategy from './middlewares/oAuthMiddleware.js'

// Verifica variabili d'ambiente essenziali
const requiredEnvVars = [
    'PORT',
    'mongoUrl',
    'JWT_SECRET_KEY',
    'CLOUD_NAME',
    'CLOUDINARY_APY_KEY',
    'CLOUDINARY_APY_SECRET_KEY',
    'FRONTEND_VERCEL_URL'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error('❌ Variabili d\'ambiente mancanti:', missingEnvVars.join(', '));
    process.exit(1);
}

const server = express()

//Routes
import eventRouter from './routes/eventsRoutes.js'
import locationRouter from './routes/locationsRoutes.js'
import userRouter from './routes/usersRoutes.js'
import authRouter from './routes/auth.js'
import dashboardRouter from './routes/dashboardRoutes.js'
    
// Middleware
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(cors({
    origin: [
        "http://localhost:5173", // Per lo sviluppo locale del frontend
        "https://attoppa.vercel.app", // URL di produzione su Vercel
        process.env.FRONTEND_VERCEL_URL // URL di produzione alternativo
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
server.use(passport.initialize())
passport.use('google', googleStrategy)

// Routes middleware
server.use('/events', eventRouter)
server.use('/locations', locationRouter)
server.use('/users', userRouter)
server.use('/auth', authRouter)
server.use('/dashboard', dashboardRouter)

// Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/')},
    filename: function (req, file, cb) { cb(null, file.originalname)}
})

function fileFilter(req, file, cb) {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(new Error('Formato non consentito.'), false)
    }
}

const upload = multer({ storage: storage, fileFilter: fileFilter })

// Utilizzo di Multer con Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_APY_KEY,
    api_secret: process.env.CLOUDINARY_APY_SECRET_KEY
})

const storageCloud = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'cloud-upload',
      format: async (req, file) => 'png',
      public_id: (req, file) => file.originalname,
    },
})

const cloud = multer({ storage: storageCloud })

// Funzione per avviare il server
const startServer = async () => {
    try {
// Connessione al database
        await connectDB();
        console.log('✅ Connesso al database MongoDB');

// Avvio server
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`🚀 Server in esecuzione sulla porta ${PORT}`);
            console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Errore durante l\'avvio del server:', error);
        process.exit(1);
    }
};

// Gestione errori non catturati
process.on('uncaughtException', (err) => {
    console.error('❌ Errore non catturato:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('❌ Promise rejection non gestita:', err);
    process.exit(1);
});

// Avvia il server
startServer();


