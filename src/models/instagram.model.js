import {Schema, model} from "mongoose";

const instagramSchema = new Schema({
    link:String,
    status:{
        type:Boolean,
        default:true,
        enum:[false, true]
    }
},{
    timestamps: true
});

const instagramModel = model("instagram", instagramSchema);

export default instagramModel