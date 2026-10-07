import ProductModel from "../models/product.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"


export const addProduct = async (req, res) => {
    try {

        const {categoryId, name, slug, des, price, discountedPrice, overView, faq, seo, shortDes, status } = req.body;

        const featureImage = req.files?.featureImage?.[0];
        const images = req.files?.image || [];

        if (categoryId?.trim() || !name?.trim() || !slug?.trim() || !des?.trim() || !price || !discountedPrice || !overView?.trim() || !shortDes?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Send all required values"
            });
        }

        if (!featureImage) {
            return res.status(400).json({
                success: false,
                message: "Feature image is required"
            });
        }

        let parsedFaq = [];

        try {
            parsedFaq =
                typeof faq === "string"
                    ? JSON.parse(faq)
                    : faq;
        } catch {
            return res.status(400).json({
                success: false,
                message: "Invalid FAQ format"
            });
        }

        if (!Array.isArray(parsedFaq) || parsedFaq.length === 0) {
            return res.status(400).json({
                success: false,
                message: "FAQ is required"
            });
        }

        let parsedSeo = {};

        try {
            parsedSeo =
                typeof seo === "string"
                    ? JSON.parse(seo)
                    : seo || {};
        } catch {
            return res.status(400).json({
                success: false,
                message: "Invalid SEO format"
            });
        }

        const duplicateSlugCheck = await ProductModel.findOne({
            slug: slug.trim()
        });

        if (duplicateSlugCheck) {
            return res.status(400).json({
                success: false,
                message: "Duplicate Slug"
            });
        }

        const featureImageResult = await uploadToCloudinary(
            featureImage.buffer,
            name
        );

        const imageResult = [];

        if (images.length > 0) {
            const uploadedImages = await Promise.all(
                images.map(async (image) => {
                    const result = await uploadToCloudinary(
                        image.buffer,
                        name
                    );

                    return result.secure_url;
                })
            );

            imageResult.push(...uploadedImages);
        }

        const productDetails = await ProductModel.create({
            categoryId: categoryId.trim(),
            name: name.trim(),
            slug: slug.trim(),
            des: des.trim(),
            price: String(price),
            discountedPrice: String(discountedPrice),
            overView: overView.trim(),
            faq: parsedFaq,
            seo: parsedSeo,
            shortDes: shortDes.trim(),
            featureImage: featureImageResult.secure_url,
            image: imageResult,
            status:
                status === true ||
                status === "true"
        });

        if (!productDetails) {
            return res.status(500).json({
                success: false,
                message: "Failed to add product"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: productDetails
        });

    } catch (err) {
        console.error("Add product error:", err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const {categoryId, name, slug, des, price, discountedPrice, overView, faq, seo, shortDes, status } = req.body;

        const product = await ProductModel.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (categoryId?.trim() || !name?.trim() || !slug?.trim() || !des?.trim() || !price || !discountedPrice || !overView?.trim() || !shortDes?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Send all required values"
            });
        }

        let parsedFaq = [];

        try {
            parsedFaq =
                typeof faq === "string"
                    ? JSON.parse(faq)
                    : faq;
        } catch {
            return res.status(400).json({
                success: false,
                message: "Invalid FAQ format"
            });
        }

        if (!Array.isArray(parsedFaq) || parsedFaq.length === 0) {
            return res.status(400).json({
                success: false,
                message: "FAQ is required"
            });
        }

        let parsedSeo = {};

        try {
            parsedSeo =
                typeof seo === "string"
                    ? JSON.parse(seo)
                    : seo || {};
        } catch {
            return res.status(400).json({
                success: false,
                message: "Invalid SEO format"
            });
        }

        const newFeatureImage =
            req.files?.featureImage?.[0];

        const newImages =
            req.files?.image || [];

        let featureImageUrl =
            product.featureImage;

        if (newFeatureImage) {
            const featureImageResult =
                await uploadToCloudinary(
                    newFeatureImage.buffer,
                    name
                );

            featureImageUrl =
                featureImageResult.secure_url;

            if (product.featureImage) {
                await deleteFromCloudinary(
                    product.featureImage
                );
            }
        }

        let imageResult =
            product.image || [];

        if (newImages.length > 0) {
            const uploadedImages =
                await Promise.all(
                    newImages.map(
                        async (image) => {
                            const result =
                                await uploadToCloudinary(
                                    image.buffer,
                                    name
                                );

                            return result.secure_url;
                        }
                    )
                );

            imageResult = uploadedImages;
        }

        const updatedProduct = await ProductModel.findByIdAndUpdate(
            id,
            {
                categoryId: categoryId.trim(),
                name: name.trim(),
                slug: slug.trim(),
                des: des.trim(),
                price: String(price),
                discountedPrice: String(discountedPrice),
                overView: overView.trim(),
                faq: parsedFaq,
                seo: parsedSeo,
                shortDes: shortDes.trim(),
                featureImage: featureImageUrl,
                image: imageResult,
                status: status === true || status === "true"
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!updatedProduct) {
            return res.status(500).json({
                success: false,
                message: "Failed to update product"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (err) {
        console.error(
            "Update product error:",
            err
        );

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ProductId is required"
            });
        }

        const product = await ProductModel.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        await ProductModel.findByIdAndDelete(id);

        if (product.featureImage) {
            try {
                await deleteFromCloudinary(product.featureImage);
            } catch (error) {
                console.error(
                    "Failed to delete featured image:",
                    error.message
                );
            }
        }

        if (product.image) {
            try {
                await deleteFromCloudinary(product.image);
            } catch (error) {
                console.error(
                    "Failed to delete product image:",
                    error.message
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({ success: false, message: "Slug is required" });
        }

        const productDetails = await ProductModel.findOne({ slug: slug, status: true });

        if (!productDetails) {
            return res.status(404).json({ success: false, message: "Product not found" })
        }

        return res.status(200).json({ success: true, product: productDetails })
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

export const getProductByAdmin = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 20, 1);

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            ProductModel.find()
                .skip(skip)
                .limit(limit),

            ProductModel.countDocuments()
        ]);

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Products not found"
            });
        }

        return res.status(200).json({
            success: true,
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getProduct = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 20, 1);

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            ProductModel.find({ status: true })
                .skip(skip)
                .limit(limit),

            ProductModel.countDocuments()
        ]);

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Products not found"
            });
        }

        return res.status(200).json({
            success: true,
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required",
            });
        }

        if (status !== true && status !== false && status !== "true" && status !== "false") {
            return res.status(400).json({
                success: false,
                message: "Status must be true or false",
            });
        }

        const product = await ProductModel.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const updatedProduct =
            await ProductModel.findByIdAndUpdate(
                id,
                {
                    status: status === true || status === "true",
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        return res.status(200).json({
            success: true,
            message: updatedProduct.status
                ? "Product is now online"
                : "Product is now offline",
            product: updatedProduct,
        });
    } catch (err) {
        console.error(
            "Update product status error:",
            err
        );

        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

export const searchProducts = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 20, 1);
        const search = req.query.q?.trim() || "";

        const skip = (page - 1) * limit;

        if (!search) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const searchRegex = new RegExp(search, "i");

        const filter = {
            status: true,
            $or: [
                { name: searchRegex },
                { slug: searchRegex },
                { shortDes: searchRegex },
                { des: searchRegex }
            ]
        };

        const [products, total] = await Promise.all([
            ProductModel.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),

            ProductModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            query: search
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const searchProductsByAdmin = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 20, 1);
        const search = req.query.q?.trim() || "";

        const skip = (page - 1) * limit;

        if (!search) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const searchRegex = new RegExp(search, "i");

        const filter = {
            $or: [
                { name: searchRegex },
                { slug: searchRegex },
                { shortDes: searchRegex },
                { des: searchRegex }
            ]
        };

        const [products, total] = await Promise.all([
            ProductModel.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),

            ProductModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            query: search
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};