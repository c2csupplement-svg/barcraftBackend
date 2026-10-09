import { Schema, model } from "mongoose";

const recipeCategorySchema = new Schema({
    name:String,
    slug:String,
    shortdes: String,
    point:[String],
    seo: {
        metaTitle: {
            type: String,
            trim: true,
            maxlength: 60,
        },

        metaDescription: {
            type: String,
            trim: true,
            maxlength: 160,
        },

        keywords: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],

        canonicalUrl: {
            type: String,
            default: null,
            trim: true,
        },

        ogTitle: {
            type: String,
            default: null,
            trim: true,
        },

        ogDescription: {
            type: String,
            default: null,
            trim: true,
        },

        ogImage: {
            type: String,
            default: null,
            trim: true,
        },
        twitterTitle: {
            type: String,
            default: null,
            trim: true,
        },

        twitterDescription: {
            type: String,
            default: null,
            trim: true,
        },

        twitterImage: {
            type: String,
            default: null,
            trim: true,
        },
        facebookTitle: {
            type: String,
            default: null,
            trim: true,
        },

        facebookDescription: {
            type: String,
            default: null,
            trim: true,
        },

        facebookImage: {
            type: String,
            default: null,
            trim: true,
        },
    },
    status:{
        type:Boolean,
        default:true,
        enum:[false, true]
    }
}, {timestamps: true});

const recipeCategoryModel = model("RecipeCategory", recipeCategorySchema);

export default recipeCategoryModel;