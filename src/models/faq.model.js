import { Schema, model } from "mongoose";

const faqSchema = new Schema({
    question:String,
    answer:String,
    status:{
        type:Boolean,
        default:true,
        enum:[false, true]
    }
}, {
    timestamps: true
})

const faqModel = model("FAQs", faqSchema);

export default faqModel