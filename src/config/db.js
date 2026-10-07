import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default async function databaseConfig () {
    try{
        const db = await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connection successfully");
        return db;
    }
    catch(err){
        console.error("Database Connection Failed.");
    }
}