import { Schema, model } from "mongoose";

const bookingSchema = new Schema({
    name:String,
    phone:Number,
    venueName:String,
    address:String,
    guestNumber:Number,
    date:String,
    email:String,
    flavour:[String],
    addon:[String]
})