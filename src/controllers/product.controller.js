import ProductModel from "../models/product.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

export const addProduct = async (req, res) => {
    try {
        const { categoryId, name, slug, description, shortDes, flavour, serve, spirits, pairs,
            nutrition, intgredient, variants, seo, faq, status } = req.body;

        const featureImage = req.files?.featureImage?.[0];
        const images = req.files?.image?.[0];

        if (!categoryId?.trim() || !name?.trim() || !slug?.trim() || !description?.trim() || !shortDes?.trim() || !serve?.trim() || !flavour) {
            return res.status(400).json({
                success: false,
                message: "Send Required Field"
            });
        }

        if (!images || !featureImage) {
            return res.status(400).json({
                success: false,
                message: "Mobile and Desktop product images are both required"
            });
        }

        const duplicateProduct = await ProductModel.findOne({
            slug: slug.trim()
        });

        if (duplicateProduct) {
            return res.status(400).json({
                success: false,
                message: "Duplicate Product Slug"
            });
        }

        const parseJSON = (value, defaultValue) => {
            if (value === undefined || value === null || value === "") {
                return defaultValue;
            }

            if (typeof value === "string") {
                try {
                    return JSON.parse(value);
                } catch (error) {
                    return defaultValue;
                }
            }

            return value;
        };

        const parseFlavour = parseJSON(flavour, []);
        const parseSpirits = parseJSON(spirits, []);
        const parsePairs = parseJSON(pairs, []);
        const parseNutrition = parseJSON(nutrition, []);
        const parseIngredient = parseJSON(intgredient, []);
        const parseVariants = parseJSON(variants, []);
        const parseSeo = parseJSON(seo, {});
        const parseFaq = parseJSON(faq, []);

        if (!Array.isArray(parseNutrition) || parseNutrition.length === 0 || !Array.isArray(parseSpirits) || parseSpirits.length === 0 ||
            !Array.isArray(parsePairs) || parsePairs.length === 0 || !Array.isArray(parseIngredient) || parseIngredient.length === 0 ||
            !Array.isArray(parseVariants) || parseVariants.length === 0 || !Array.isArray(parseFaq) || parseFaq.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Send Required Field"
            });
        }

        const imageResult = await uploadToCloudinary(
            images.buffer,
            `${name.trim()}-image`
        )

        const featureImageResult = await uploadToCloudinary(
            featureImage.buffer,
            `${name.trim()}-feature`
        );

        const product = await ProductModel.create({
            categoryId: categoryId.trim(),
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim(),
            shortDes: shortDes.trim(),
            serve: serve.trim(),
            image:imageResult.secure_url,
            featureImage: featureImageResult.secure_url,
            flavour: parseFlavour,
            spirits: parseSpirits,
            pairs: parsePairs,
            nutrition: parseNutrition,
            intgredient: parseIngredient,
            variants: parseVariants,
            seo: parseSeo,
            faq: parseFaq,

            status: status === undefined ? true : status
        });

        return res.status(201).json({
            success: true,
            message: "Product added successfully",
            product
        });

    } catch (err) {
        console.error("Add Product Error:", err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};