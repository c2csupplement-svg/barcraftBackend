import BlogCategoryModel from "../models/blogCategory.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import BlogModel from "../models/blog.model.js";

export const createCategory = async (req, res) => {
    try {
        const { name, slug, seo, status } = req.body;
        const image = req.files?.image?.[0];

        if (!name?.trim() || !slug?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name and Slug both required"
            });
        }

        const checkDuplicated = await BlogCategoryModel.findOne({
            slug: slug?.trim()
        });

        if (checkDuplicated) {
            return res.status(400).json({
                success: false,
                message: "Duplicate Slug"
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

        let imageResult = null;

        if (image) {
            imageResult = await uploadToCloudinary(
                image.buffer,
                name?.trim()
            );
        }

        const categoryDetail = await BlogCategoryModel.create({
            name: name?.trim(),
            slug: slug?.trim(),
            image: imageResult?.secure_url || null,
            seo: parsedSeo,
            status:status
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            category: categoryDetail
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, seo, status } = req.body;
        const image = req.files?.image?.[0];

        if(!id){
            return res.status(400).json({success:false, message: "Id is required"})
        }

        const category = await BlogCategoryModel.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        if (!name?.trim() || !slug?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name and Slug both required"
            });
        }

        const duplicateCategory = await BlogCategoryModel.findOne({
            slug: slug?.trim(),
            _id: { $ne: id }
        });

        if (duplicateCategory) {
            return res.status(400).json({
                success: false,
                message: "Duplicate Slug"
            });
        }

        let parsedSeo = category.seo || {};

        if (seo !== undefined) {
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
        }

        if (image) {
            if (category.image) {
                try {
                    await deleteFromCloudinary(category.image);
                } catch (error) {
                    console.log(
                        "Old category image delete failed:",
                        error.message
                    );
                }
            }

            const imageResult = await uploadToCloudinary(
                image.buffer,
                name?.trim()
            );

            category.image = imageResult.secure_url;
        }

        category.name = name?.trim();
        category.slug = slug?.trim();
        category.seo = parsedSeo;
        category.status = status;

        await category.save();

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await BlogCategoryModel.find({ status: true })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getCategoriesByAdmin = async (req, res) => {
    try {
        const categories = await BlogCategoryModel.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Id is required"
            });
        }

        const category = await BlogCategoryModel.findById(id).select("status name slug");

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const blogs = await BlogModel.find({
            categoryId: id
        }).select("_id categoryId slug title description image status");

        return res.status(200).json({
            success: true,
            category,
            blogs
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if(!id){
            return res.status(400).json({success:false, message: "Id is required"})
        }

        const category = await BlogCategoryModel.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const presentBlog = await BlogModel.findOne({
            categoryId: id
        });

        if (presentBlog) {
            return res.status(400).json({
                success: false,
                message: "We can't delete this category because blogs are associated with it"
            });
        }

        if (category.image) {
            try {
                await deleteFromCloudinary(category.image);
            } catch (error) {
                console.log(
                    "Category image delete failed:",
                    error.message
                );
            }
        }

        await BlogCategoryModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};