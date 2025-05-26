import express from 'express'
import cors from 'cors'
import "dotenv/config"
import connectDB from './connectdb.js'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import {CloudinaryStorage} from "multer-storage-cloudinary"

const server = express()

// Middleware
server.use(express.json())
server.use(cors())

//Multer//
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/')}, // imposto la cartella di destinazione dei file 
    filename: function (req, file, cb) { cb(null, file.originalname)} // imposto il nome del file
})

function fileFilter(req, file, cb) {
    // Middleware custom che ci permette di caricare solo i file di tipo jpg jpeg e png
    
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        // se condizione rispettata, allora cb è true:
        cb(null, true)
    } else {
        // se non rispettata, ritorna false e messaggio di errore:
        cb(null, false)
        // You can always pass an error if something goes wrong:
        return cb(new error('Formato non consentito!!!'))
    }
}

const upload = multer({ storage: storage, fileFilter: fileFilter }) // oggetto che definisce cosa deve "compilare" il multer.


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
      format: async (req, file) => 'png', // supports promises as well
      public_id: (req, file) => file.originalname,
    },
  });

const cloud = multer({ storage: storageCloud })


server.listen(process.env.PORT, () => {  // .listen è il metodo che accende il server su una porta.
    console.log(`Node app listening on port ${process.env.PORT}`)
})

connectDB()


