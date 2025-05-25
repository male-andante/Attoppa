import mongoose from "mongoose"
import "dotenv/config"



async function connectDB(){
    try{
        await mongoose.connect(process.env.mongoUrl + process.env.dbName)
        console.log('MongoDB connesso') // metodo di connessione al DB.
    } catch(err) {
        console.error(err)
    }
 
}

export default connectDB