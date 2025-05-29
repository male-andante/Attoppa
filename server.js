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

const server = express()

//Routes
import eventRouter from './routes/eventsRoutes.js'
import locationRouter from './routes/locationsRoutes.js'
import userRouter from './routes/usersRoutes.js'
import authRouter from './routes/auth.js'
import dashboardRouter from './routes/dashboardRoutes.js'
    
// Middleware
server.use(express.json())
server.use(cors())
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
  });

const cloud = multer({ storage: storageCloud })


server.listen(process.env.PORT, () => {
    console.log(`Node app listening on port ${process.env.PORT}`)
})

connectDB()


