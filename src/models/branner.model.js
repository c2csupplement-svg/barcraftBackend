import { Schema, model } from "mongoose";

const bannerSchema = new Schema({
    title:String,
    shortdes: String,
    tag:String,
    desktopImg:String,
    mobileImg:String,
    link:String,
    status:{
        type:Boolean,
        default:true,
        enum:[false, true]
    }
},{
    timestamps: true
});

const bannerModel = model("banner", bannerSchema);

export default bannerModel;