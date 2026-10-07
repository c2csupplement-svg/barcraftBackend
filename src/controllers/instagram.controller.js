import InstagramModel from "../models/instagram.model.js";


export const addInstagramPost = async (req, res) => {
    try {
        const { link, status } = req.body;

        if (!link?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Instagram post link is required"
            });
        }

        const post = await InstagramModel.create({
            link: link.trim(),
            status: status
        });

        return res.status(201).json({
            success: true,
            message: "Instagram post added successfully",
            post
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getInstagramPostsByAdmin = async (req, res) => {
    try {
        const page = Math.max(
            parseInt(req.query.page) || 1,
            1
        );

        const limit = Math.max(
            parseInt(req.query.limit) || 20,
            1
        );

        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            InstagramModel.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            InstagramModel.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            posts,
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

export const getInstagramPostsByUser = async (req, res) => {
    try {
        const posts = await InstagramModel.find({
            status: true
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            posts
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const updateInstagramPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { link, status } = req.body;

        if(!id){
            return res.status(400).json({success:false, message: "Id is required"})
        }

        const post = await InstagramModel.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Instagram post not found"
            });
        }

        if (link !== undefined) {
            if (!link.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Instagram post link is required"
                });
            }

            post.link = link.trim();
        }

        if (status !== undefined) {
            post.status =
                status === true ||
                status === "true";
        }

        await post.save();

        return res.status(200).json({
            success: true,
            message: "Instagram post updated successfully",
            post
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const deleteInstagramPost = async (req, res) => {
    try {
        const { id } = req.params;

        if(!id){
            return res.status(400).json({success:false, message: "Id is required"})
        }

        const post = await InstagramModel.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Instagram post not found"
            });
        }

        await InstagramModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Instagram post deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};