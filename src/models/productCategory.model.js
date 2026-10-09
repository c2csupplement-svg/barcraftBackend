import { Schema, model } from "mongoose";

const productCategorySchema = new Schema({
    name:String,
    slug: String,
    shortdes:String,
    desktopImage : String,
    mobileImage:String,
    status:{
        type:Boolean,
        default: true,
        enum:[true, false]
    }
},{timestamps: true});

const productCategoryModel = model("Product category", productCategorySchema);

export default productCategoryModel;