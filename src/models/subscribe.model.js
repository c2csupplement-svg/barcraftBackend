import {Schema, model} from "mongoose";

const subcribeSchema = new Schema({
    email:String
});

const subscribeModel = model("Subscribe", subcribeSchema);

export default subscribeModel;