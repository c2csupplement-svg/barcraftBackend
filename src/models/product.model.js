import { Schema, model } from "mongoose";

const { ObjectId } = Schema

const productSchema = new Schema({
    categoryId: {
        type: ObjectId,
        ref: "Product category"
    },
    name: {
        type: String
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
    },
    shortDes: {
        type: String
    },
    featureImage: {
        type: String
    },
    image: String,
    bottleImage:String,
    flavour: {
        name: String,
        des: String
    },
    serve: String,
    spirits: [String],
    pairs: [String],
    nutrition: [{
        name: String,
        value: String
    }],
    intgredient: [{
        name: String,
        value: String
    }],
    variants: [{
        name: String,
        image: String,
    }],
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
    faq: [
        {
            question: {
                type: String
            },
            answer: {
                type: String
            }
        }
    ],
    review: [{
        name: String,
        rating: Number,
        des: String,
        image: [String]
    }],
    status: {
        type: Boolean,
        default: true,
        enum: [false, true]
    }
},
    { timestamps: true }
);

const productModel = model("Products", productSchema);

export default productModel