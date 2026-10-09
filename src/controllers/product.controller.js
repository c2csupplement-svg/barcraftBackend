import ProductModel from "../models/product.model.js";
import ProductCategoryModel from "../models/productCategory.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

export const addProduct = async (req, res) => {
    try {
        const { categoryId, name, slug, description, shortDes, flavour, serve, spirits, pairs,
            nutrition, intgredient, variants, seo, faq, status } = req.body;

        const featureImage = req.files?.featureImage?.[0];
        const images = req.files?.image?.[0];
        const bottleImage = req.files?.bottle?.[0];

        if (!categoryId?.trim() || !name?.trim() || !slug?.trim() || !description?.trim() || !shortDes?.trim() || !serve?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Send Required Field"
            });
        }

        if (flavour && Object.keys(flavour).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Flavour Required Field"
            });
        }

        if (!images || !featureImage || !bottleImage) {
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

        const parseFlavour = parseJSON(flavour, {});
        const parseSpirits = parseJSON(spirits, []);
        const parsePairs = parseJSON(pairs, []);
        const parseNutrition = parseJSON(nutrition, []);
        const parseIngredient = parseJSON(intgredient, []);
        const parseVariants = parseJSON(variants, []);
        const parseSeo = parseJSON(seo, {});
        const parseFaq = parseJSON(faq, []);

        if (parseNutrition.length === 0 || parseSpirits.length === 0 || parsePairs.length === 0 || parseIngredient.length === 0 ||
            parseVariants.length === 0 || parseFaq.length === 0) {
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

        const bottleImageResult = await uploadToCloudinary(
            bottleImage.buffer,
            `${name.trim()}-bottle`
        )

        const product = await ProductModel.create({
            categoryId: categoryId.trim(),
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim(),
            shortDes: shortDes.trim(),
            serve: serve.trim(),
            image: imageResult.secure_url,
            featureImage: featureImageResult.secure_url,
            bottleImage: bottleImageResult.secure_url,
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

export const updateProduct = async (req, res) => {
    try {

        const { id } = req.params;

        const { categoryId, name, slug, description, shortDes, flavour, serve, spirits, pairs,
            nutrition, intgredient, variants, seo, faq, status } = req.body;

        const featureImage = req.files?.featureImage?.[0];
        const image = req.files?.image?.[0];
        const bottleImage = req.files?.[0];

        if (!id.trim()) {
            return res.status(400).json({ success: false, message: "ProductId is required" });
        }

        const productDetails = await ProductModel.findById(id);

        if (!productDetails) {
            return res.status(404).json({ success: false, message: "Product not found" });
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


        const parseFlavour = parseJSON(flavour, {});
        const parseSpirits = parseJSON(spirits, []);
        const parsePairs = parseJSON(pairs, []);
        const parseNutrition = parseJSON(nutrition, []);
        const parseIngredient = parseJSON(intgredient, []);
        const parseVariants = parseJSON(variants, []);
        const parseSeo = parseJSON(seo, {});
        const parseFaq = parseJSON(faq, []);

        if (categoryId.trim()) {
            productDetails.categoryId = categoryId.trim();
        };
        if (name.trim()) {
            productDetails.name = name.trim();
        };
        if (slug.trim()) {
            productDetails.slug = slug.trim();
        };
        if (description.trim()) {
            productDetails.description = description.trim();
        };
        if (shortDes.trim()) {
            productDetails.shortDes = shortDes.trim();
        };
        if (serve.trim()) {
            productDetails.serve = serve.trim();
        }
        if (flavour && Object.keys(flavour).length > 0) {
            productDetails.flavour = parseFlavour
        };
        if (parseNutrition.length !== 0) {
            productDetails.nutrition = parseIngredient
        };
        if (parseSpirits.length !== 0) {
            productDetails.spirits = parseSpirits;
        };
        if (parsePairs.length !== 0) {
            productDetails.pairs = parsePairs;
        };
        if (parseVariants.length !== 0) {
            productDetails.variants = parseVariants
        };
        if (parseSeo) {
            productDetails.seo = parseSeo;
        };
        if (parseFaq.length !== 0) {
            productDetails.faq = parseFaq
        }
        if (featureImage) {
            const oldFeaturedImage = productDetails.featureImage;

            productDetails.featureImage = await uploadToCloudinary(
                featureImage.buffer,
                `${name.trim()}-feature`
            );

            if(oldFeaturedImage){
                await deleteFromCloudinary(oldFeaturedImage)
            }
        };
        if (image) {
            const oldImage = productDetails.image;

            productDetails.image = await uploadToCloudinary(
                image.buffer,
                `${name.trim()}-image`
            );

            if(oldImage){
                await deleteFromCloudinary(oldImage)
            }
        };
        if(bottleImage){
            const oldImage = productDetails.bottleImage;

            productDetails.bottleImage = await uploadToCloudinary(
                bottleImage.buffer,
                `${name.trim()}-bottle`
            );

            if(oldImage){
                await deleteFromCloudinary(oldImage)
            }
        }
        if (status !== undefined) {
            productDetails.status = status
        };

        await productDetails.save();

        res.status(200).json({ success: true, message: "Product Update Successfully" });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id.trim()) {
            return res.status(400).json({ success: false, message: "ProductId is required" });
        }

        const productDetail = await ProductModel.findByIdAndDelete(id);

        if (!productDetail) {
            return res.status(404).json({ success: false, message: "Product not found" });
        };

        return res.status(200).json({ success: true, message: "Product Delete Successfully" });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

export const updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id.trim()) {
            return res.status(400).json({ success: false, message: "ProductId is required" });
        }

        const productDetails = await ProductModel.findById(id);

        if (!productDetails) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        productDetails.status = status;

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
            totalPages,
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
            totalPages,
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

        if (!slug.trim()) {
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

        if (!id.trim()) {
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
            totalPages,
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

        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required."
            })
        }

        const skip = (page - 1) * limit;

        const search = q.trim();

        const searchRegex = new RegExp(query, "i");

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
            query,
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

        if (!slug.trim()) {
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