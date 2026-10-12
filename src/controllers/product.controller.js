import ProductModel from "../models/product.model.js";
import ProductCategoryModel from "../models/productCategory.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";


const parseJSON = (value, defaultValue) => {
    if (value === undefined || value === null || value === "") {
        return defaultValue;
    }

    if (typeof value !== "string") {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        throw new Error("Invalid JSON data in request");
    }
};

const parseStatus = (value, defaultValue = true) => {
    if (value === undefined || value === null || value === "") {
        return defaultValue;
    }

    if (typeof value === "boolean") {
        return value;
    }

    if (value === "true") return true;
    if (value === "false") return false;

    throw new Error("Status must be true or false");
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const removeCloudinaryImages = async (urls) => {
    for (const url of urls) {
        if (!url) continue;

        try {
            await deleteFromCloudinary(url);
        } catch (error) {
            console.error("Cloudinary delete error:", error.message);
        }
    }
};

const uploadImage = async (file, publicId) => {
    if (!file) return null;

    const result = await uploadToCloudinary(file.buffer, publicId);

    if (!result?.secure_url) {
        throw new Error("Image upload failed");
    }

    return result.secure_url;
};

const uploadVariantImages = async (variants, files, slug) => {
    const updatedVariants = [...variants];

    for (let i = 0; i < (files || []).length; i++) {
        const imageUrl = await uploadImage(
            files[i],
            `${slug}-variant-${i + 1}`
        );

        const variantIndex = i;

        if (updatedVariants[variantIndex]) {
            updatedVariants[variantIndex] = {
                ...updatedVariants[variantIndex],
                image: imageUrl
            };
        }
    }

    return updatedVariants;
};

export const addProduct = async (req, res) => {
    const uploadedImages = [];

    try {
        const { categoryId,name,slug, description, shortDes, flavour,serve, spirits,pairs, nutrition,intgredient,recipe, variants,seo,
            faq,status} = req.body;

        if ( !categoryId?.trim() || !name?.trim() ||!slug?.trim() ||!description?.trim() ||
            !shortDes?.trim() ||!serve?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category, name, slug, description, short description and serving instructions are required"
            });
        }

        if (!isValidObjectId(categoryId.trim())) {
            return res.status(400).json({
                success: false,
                message: "Invalid categoryId"
            });
        }

        const featureImageFile = req.files?.featureImage?.[0];
        const imageFile = req.files?.image?.[0];
        const bottleImageFile = req.files?.bottle?.[0];
        const variantFiles = req.files?.variant || [];

        if (!featureImageFile || !imageFile || !bottleImageFile) {
            return res.status(400).json({
                success: false,
                message: "Feature image, product image and bottle image are required"
            });
        }

        const parsedFlavour = parseJSON(flavour, {});
        const parsedSpirits = parseJSON(spirits, []);
        const parsedPairs = parseJSON(pairs, []);
        const parsedNutrition = parseJSON(nutrition, []);
        const parsedIngredient = parseJSON(intgredient, []);
        const parsedVariants = parseJSON(variants, []);
        const parsedSeo = parseJSON(seo, {});
        const parsedFaq = parseJSON(faq, []);
        const parsedRecipe = parseJSON(recipe, []);

        if (
            !parsedFlavour ||
            typeof parsedFlavour !== "object" ||
            Array.isArray(parsedFlavour) ||
            !parsedFlavour.name?.trim() ||
            !parsedFlavour.des?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Flavour name and description are required"
            });
        }

        if ( !Array.isArray(parsedSpirits) ||!Array.isArray(parsedPairs) ||
            !Array.isArray(parsedNutrition) ||!Array.isArray(parsedIngredient) || !Array.isArray(parsedVariants) ||
            !Array.isArray(parsedFaq) || !Array.isArray(parsedRecipe) ) {
            return res.status(400).json({
                success: false,
                message: "Spirits, pairs, nutrition, ingredients, variants, FAQ and recipe must be arrays"
            });
        }

        if ( parsedSpirits.length === 0 ||parsedPairs.length === 0 || parsedNutrition.length === 0 ||
            parsedIngredient.length === 0 ||parsedVariants.length === 0 || parsedFaq.length === 0 ) {
            return res.status(400).json({
                success: false,
                message: "Spirits, pairs, nutrition, ingredients, variants and FAQ are required"
            });
        }

        if (variantFiles.length > parsedVariants.length) {
            return res.status(400).json({
                success: false,
                message: "More variant images were uploaded than variants provided"
            });
        }

        const duplicateProduct = await ProductModel.findOne({
            slug: slug.trim()
        });

        if (duplicateProduct) {
            return res.status(409).json({
                success: false,
                message: "Duplicate Product Slug"
            });
        }

        for (const recipeId of parsedRecipe) {
            if (!isValidObjectId(recipeId)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid recipe ID: ${recipeId}`
                });
            }
        }

        const featureImageUrl = await uploadImage(
            featureImageFile,
            `${slug.trim()}-feature`
        );
        uploadedImages.push(featureImageUrl);

        const imageUrl = await uploadImage(
            imageFile,
            `${slug.trim()}-image`
        );
        uploadedImages.push(imageUrl);

        const bottleImageUrl = await uploadImage(
            bottleImageFile,
            `${slug.trim()}-bottle`
        );
        uploadedImages.push(bottleImageUrl);

        const parsedVariantsWithImages = await uploadVariantImages(
            parsedVariants,
            variantFiles,
            slug.trim()
        );

        const newVariantUrls = parsedVariantsWithImages
            .filter((variant, index) => variantFiles[index])
            .map((variant) => variant.image);

        uploadedImages.push(...newVariantUrls);

        const product = await ProductModel.create({
            categoryId: categoryId.trim(),
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim(),
            shortDes: shortDes.trim(),
            featureImage: featureImageUrl,
            image: imageUrl,
            bottleImage: bottleImageUrl,
            flavour: parsedFlavour,
            serve: serve.trim(),
            spirits: parsedSpirits,
            pairs: parsedPairs,
            nutrition: parsedNutrition,
            intgredient: parsedIngredient,
            variants: parsedVariantsWithImages,
            recipe: parsedRecipe,
            seo: parsedSeo,
            faq: parsedFaq,
            status: parseStatus(status, true)
        });

        return res.status(201).json({
            success: true,
            message: "Product added successfully",
            product
        });
    } catch (error) {
        await removeCloudinaryImages(uploadedImages);

        console.error("Add Product Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to add product"
        });
    }
};

export const updateProduct = async (req, res) => {
    const uploadedImages = [];
    const oldImagesToDelete = [];

    try {
        const { id } = req.params;

        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "A valid Product ID is required"
            });
        }

        const product = await ProductModel.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const { categoryId,name,slug, description, shortDes, flavour,serve, spirits,pairs, nutrition,intgredient,recipe, variants,seo,
            faq,status} = req.body;

        const parsedName =
            name !== undefined ? name.trim() : product.name;

        const parsedSlug =
            slug !== undefined ? slug.trim() : product.slug;

        if (
            !parsedName ||
            !parsedSlug ||
            (description !== undefined && !description.trim()) ||
            (shortDes !== undefined && !shortDes.trim()) ||
            (serve !== undefined && !serve.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Product name, slug and provided text fields cannot be empty"
            });
        }

        if (categoryId !== undefined) {
            if (!categoryId.trim() || !isValidObjectId(categoryId.trim())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid categoryId"
                });
            }

            product.categoryId = categoryId.trim();
        }

        if (parsedSlug !== product.slug) {
            const duplicateProduct = await ProductModel.findOne({
                slug: parsedSlug,
                _id: { $ne: id }
            });

            if (duplicateProduct) {
                return res.status(409).json({
                    success: false,
                    message: "Duplicate Product Slug"
                });
            }
        }

        product.name = parsedName;
        product.slug = parsedSlug;

        if (description !== undefined) {
            product.description = description.trim();
        }

        if (shortDes !== undefined) {
            product.shortDes = shortDes.trim();
        }

        if (serve !== undefined) {
            product.serve = serve.trim();
        }

        if (flavour !== undefined) {
            const value = parseJSON(flavour, {});

            if (
                !value ||
                typeof value !== "object" ||
                Array.isArray(value)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Flavour must be an object"
                });
            }

            product.flavour = value;
        }

        if (spirits !== undefined) {
            const value = parseJSON(spirits, []);
            if (!Array.isArray(value)) {
                return res.status(400).json({
                    success: false,
                    message: "Spirits must be an array"
                });
            }
            product.spirits = value;
        }

        if (pairs !== undefined) {
            const value = parseJSON(pairs, []);
            if (!Array.isArray(value)) {
                return res.status(400).json({
                    success: false,
                    message: "Pairs must be an array"
                });
            }
            product.pairs = value;
        }

        if (nutrition !== undefined) {
            const value = parseJSON(nutrition, []);
            if (!Array.isArray(value)) {
                return res.status(400).json({
                    success: false,
                    message: "Nutrition must be an array"
                });
            }
            product.nutrition = value;
        }

        if (intgredient !== undefined) {
            const value = parseJSON(intgredient, []);
            if (!Array.isArray(value)) {
                return res.status(400).json({
                    success: false,
                    message: "Ingredients must be an array"
                });
            }
            product.intgredient = value;
        }

        if (variants !== undefined) {
            const value = parseJSON(variants, []);
            if (!Array.isArray(value)) {
                return res.status(400).json({
                    success: false,
                    message: "Variants must be an array"
                });
            }
            product.variants = value;
        }

        if (recipe !== undefined) {
            const value = parseJSON(recipe, []);

            if (
                !Array.isArray(value) ||
                value.some((recipeId) => !isValidObjectId(recipeId))
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Recipe must be an array of valid recipe IDs"
                });
            }

            product.recipe = value;
        }

        if (seo !== undefined) {
            const value = parseJSON(seo, {});

            if (!value || typeof value !== "object" || Array.isArray(value)) {
                return res.status(400).json({
                    success: false,
                    message: "SEO must be an object"
                });
            }

            product.seo = value;
        }

        if (faq !== undefined) {
            const value = parseJSON(faq, []);
            if (!Array.isArray(value)) {
                return res.status(400).json({
                    success: false,
                    message: "FAQ must be an array"
                });
            }
            product.faq = value;
        }

        if (status !== undefined) {
            product.status = parseStatus(status, product.status);
        }

        const featureImageFile = req.files?.featureImage?.[0];
        const imageFile = req.files?.image?.[0];
        const bottleImageFile = req.files?.bottle?.[0];
        const variantFiles = req.files?.variant || [];

        const uploadAndReplace = async (file, field, suffix) => {
            if (!file) return;

            const oldUrl = product[field];

            const newUrl = await uploadImage(
                file,
                `${parsedSlug}-${suffix}`
            );

            uploadedImages.push(newUrl);
            product[field] = newUrl;

            if (oldUrl) {
                oldImagesToDelete.push(oldUrl);
            }
        };

        await uploadAndReplace(
            featureImageFile,
            "featureImage",
            "feature"
        );

        await uploadAndReplace(
            imageFile,
            "image",
            "image"
        );

        await uploadAndReplace(
            bottleImageFile,
            "bottleImage",
            "bottle"
        );

        if (variantFiles.length > 0) {
            if (variants === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Send the variants array when uploading variant images"
                });
            }

            const parsedVariants = parseJSON(variants, []);

            if (
                !Array.isArray(parsedVariants) ||
                variantFiles.length > parsedVariants.length
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Variant images must match the variants array"
                });
            }

            const updatedVariants = [...parsedVariants];

            for (let i = 0; i < variantFiles.length; i++) {
                const oldUrl = updatedVariants[i]?.image;

                const newUrl = await uploadImage(
                    variantFiles[i],
                    `${parsedSlug}-variant-${i + 1}`
                );

                uploadedImages.push(newUrl);

                updatedVariants[i] = {
                    ...updatedVariants[i],
                    image: newUrl
                };

                if (oldUrl) {
                    oldImagesToDelete.push(oldUrl);
                }
            }

            product.variants = updatedVariants;
        }

        await product.save();

        await removeCloudinaryImages(oldImagesToDelete);

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        await removeCloudinaryImages(uploadedImages);

        console.error("Update Product Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update product"
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "A valid Product ID is required"
            });
        }

        const product = await ProductModel.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const imageUrls = [
            product.featureImage,
            product.image,
            product.bottleImage,
            ...(product.variants || []).map((variant) => variant.image)
        ].filter(Boolean);

        await ProductModel.findByIdAndDelete(id);

        await removeCloudinaryImages(imageUrls);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Delete Product Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to delete product"
        });
    }
};


export const updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id?.trim()) {
            return res.status(400).json({ success: false, message: "ProductId is required" });
        }

        const productDetails = await ProductModel.findById(id);

        if (!productDetails) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        productDetails.status = !productDetails.status;

        await productDetails.save();

        return res.status(200).json({ success: true, message: "Product Status Update Successfully" })
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

export const getProductByAdmin = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);

        const skip = (page - 1) * limit;

        const [product, total] = await Promise.all([
            ProductModel.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            ProductModel.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            count: product.length,
            total,
            page,
            limit,
            totalPages:Math.ceil(total / limit),
            product
        })
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

export const getProduct = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);

        const skip = (page - 1) * limit;

        const [product, total] = await Promise.all([
            ProductModel.find({ status: true })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            ProductModel.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            count: product.length,
            total,
            page,
            limit,
            totalPages:Math.ceil(total / limit),
            product
        })
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

export const getProuctBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        if (!slug?.trim()) {
            return res.status(400).json({ success: false, message: "Slug is required" });
        }

        const productDetails = await ProductModel.findOne({ slug: slug });

        if (!productDetails) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.status(200).json({ success: true, product: productDetails })
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

export const getProductbyCategoryId = async (req, res) => {
    try {
        const { id } = req.params;

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);

        const skip = (page - 1) * limit;

        if (!id?.trim()) {
            return res.status(400).json({ success: false, message: "ProductId is required" });
        }

        const [product, total] = await Promise.all([
            ProductModel.find({
                categoryId: id,
                status: true
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            ProductModel.countDocuments()
        ])


        return res.status(200).json({
            success: true,
            count: product.length,
            total,
            page,
            limit,
            totalPages:Math.ceil(total / limit),
            product
        })
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

export const searchProduct = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);

        const { q } = req.query;
        
        if (!q || !q?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required."
            })
        }

        const skip = (page - 1) * limit;

        const search = q?.trim();

        const searchRegex = new RegExp(search, "i");

        const categories = await ProductCategoryModel.find({
            $or: [
                { name: searchRegex },
                { slug: searchRegex }
            ]
        }).select("_id");

        const categoryIds = categories.map(categoryId => categoryId._id);

        const filter = {
            $or: [
                { name: searchRegex },
                { slug: searchRegex },
                { categoryId: { $in: categoryIds } },
            ]
        };

        const [products, total] = await Promise.all([
            ProductModel.find(filter)
                .populate("categoryId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            ProductModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

export const getProductByCategorySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);

        const skip = (page - 1) * limit;

        if (!slug?.trim()) {
            return res.status(400).json({ success: false, message: "Slug is required." });
        };

        const categoryId = await ProductCategoryModel.findOne({ slug: slug })?._id;

        const [products, total] = await Promise.all([
            ProductModel.find({ categoryId: categoryId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            ProductModel.countDocuments({ categoryId: categoryId })
        ]);

        return res.status(200).json({
            success: true,
            query,
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    }
    catch (err) {
        return req.status(500).json({ success: false, message: err.message })
    }
}