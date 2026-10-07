import BlogModel from "../models/blog.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import blogCategoryModel from "../models/blogCategory.model.js";

export const createBlog = async (req, res) => {
    try {
        const { categoryId, slug, title, description, content, author, seo, status } = req.body;

        if (!categoryId?.trim() || !slug?.trim() || !title?.trim() || !description?.trim() || !content?.trim() || !author?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Send Required variable"
            });
        }

        const checkDuplicate = await BlogModel.findOne({
            slug: slug.trim()
        });

        if (checkDuplicate) {
            return res.status(400).json({
                success: false,
                message: "Duplicate Slug"
            });
        }

        let imageResult = null;

        const image = req.file || req.files?.image?.[0];

        if (image) {
            imageResult = await uploadToCloudinary(
                image.buffer,
                title.trim()
            );
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

        const blogDetail = await BlogModel.create({
            categoryId: categoryId.trim(),
            slug: slug.trim(),
            title: title.trim(),
            description: description.trim(),
            image: imageResult?.secure_url || "",
            content: content.trim(),
            author: author.trim(),
            seo: parsedSeo,
            status: status
        });

        return res.status(201).json({
            success: true,
            message: "Blog added successfully",
            blog: blogDetail
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getBlogs = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);
        const skip = (page - 1) * limit;

        const [blogs, total] = await Promise.all([
            BlogModel.find({ status: true })
                .populate("categoryId", "_id name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            BlogModel.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            blogs,
            pagination: {
                page,
                limit,
                total,
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

export const getBlogsByAdmin = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);
        const skip = (page - 1) * limit;

        const [blogs, total] = await Promise.all([
            BlogModel.find()
                .populate("categoryId","_id name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            BlogModel.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            blogs,
            pagination: {
                page,
                limit,
                total,
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

export const getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({
                success: false,
                message: "Slug is required"
            });
        }

        const blog = await BlogModel.findOne({ slug })
            .select("status")
            .populate("categoryId", "_id name");

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        return res.status(200).json({
            success: true,
            blog
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const searchBlogs = async (req, res) => {
    try {
        const query = req.query.q?.trim() || "";

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);
        const skip = (page - 1) * limit;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const searchRegex = new RegExp(query, "i");

        const categories = await blogCategoryModel.find({
            $or: [
                { name: searchRegex },
                { slug: searchRegex }
            ]
        }).select("_id");

        const categoryIds = categories.map(category => category._id);

        const filter = {
            $or: [
                { title: searchRegex },
                { slug: searchRegex },
                { description: searchRegex },
                { content: searchRegex },
                { author: searchRegex },
                { categoryId: { $in: categoryIds } },
                { status: true }
            ]
        };

        const [blogs, total] = await Promise.all([
            BlogModel.find(filter)
                .populate("categoryId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            BlogModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            query,
            blogs,
            pagination: {
                page,
                limit,
                total,
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

export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: "Id is required" })
        }

        const { categoryId, slug, title, description, content, author, seo, status } = req.body;

        const image = req.files?.image?.[0];
        const blog = await BlogModel.findById(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        if (slug?.trim()) {
            const duplicateSlug = await BlogModel.findOne({
                slug: slug.trim(),
                _id: { $ne: id }
            });

            if (duplicateSlug) {
                return res.status(400).json({
                    success: false,
                    message: "Duplicate Slug"
                });
            }

            blog.slug = slug.trim();
        }

        if (categoryId?.trim()) {
            blog.categoryId = categoryId.trim();
        }

        if (title?.trim()) {
            blog.title = title.trim();
        }

        if (description?.trim()) {
            blog.description = description.trim();
        }

        if (content?.trim()) {
            blog.content = content.trim();
        }

        if (author?.trim()) {
            blog.author = author.trim();
        }

        if (status) {
            blog.status = status;
        }

        if (seo !== undefined) {
            try {
                blog.seo =
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
            const oldImage = blog.image;

            const imageResult = await uploadToCloudinary(
                image.buffer,
                blog.title
            );

            blog.image = imageResult.secure_url;

            if (oldImage) {
                try {
                    await deleteFromCloudinary(oldImage);
                } catch (error) {
                    console.log(
                        "Old image delete failed:",
                        error.message
                    );
                }
            }
        }

        await blog.save();

        return res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            blog
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: "Id is required" })
        }

        const blog = await BlogModel.findById(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        if (blog.image) {
            try {
                await deleteFromCloudinary(blog.image);
            } catch (error) {
                console.log(
                    "Cloudinary image delete failed:",
                    error.message
                );
            }
        }

        await BlogModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};