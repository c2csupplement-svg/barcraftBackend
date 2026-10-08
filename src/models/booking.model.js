import { Schema, model } from "mongoose";

const bookingSchema = new Schema({
    name:String,
    phone:String,
    venue:String,
    address:String,
    guestNumber:String,
    date:String,
    email:String,
    flavour:[String],
    addon:[String],
    status:{
        type:String,
        default: "Processing",
        enum:["Processing", "Confirm", "Done", "Cancelled"]
    }
}, {timestamps: true});

const bookingModel = model("Booking", bookingSchema);

export default bookingModel;