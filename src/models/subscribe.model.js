import {Schema, model} from "mongoose";

const subcribeSchema = new Schema({
    email:String,
    status:{
        type:Boolean,
        default: true,
        enum:[true, false]
    }
});

const subscribeModel = model("Subscribe", subcribeSchema);

export default subscribeModel;