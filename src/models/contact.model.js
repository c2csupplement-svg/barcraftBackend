import { Schema, model } from "mongoose";

const contactSchema = new Schema({
    name:String,
    email:String,
    phone:String,
    subject:String,
    message: String,
    status:{
        type: Boolean,
        default:true,
        enum:[false, true]
    }
},{timestamps: true});

const contactModel = model("Contact", contactSchema);

export default contactModel;