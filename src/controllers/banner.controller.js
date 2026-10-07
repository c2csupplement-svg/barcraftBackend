import BannerModel from "../models/branner.model.js";
import {uploadToCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js";


export const createBanner = async (req, res) => {
    try {
        const {title,shortdes,tag,link,status} = req.body;

        const mobile = req.files?.mobileImg?.[0];
        const desktop = req.files?.desktopImg?.[0];

        if (!title?.trim() ||!shortdes?.trim() ||!link?.trim() ||!tag?.trim()) {
            return res.status(400).json({
                success: false,
                message: "All required fields are required"
            });
        }

        if (!mobile || !desktop) {
            return res.status(400).json({
                success: false,
                message: "Mobile and Desktop banner images are both required"
            });
        }

        const mobileResult = await uploadToCloudinary(
            mobile.buffer,
            `${title.trim()}-mobile`
        );

        const desktopResult = await uploadToCloudinary(
            desktop.buffer,
            `${title.trim()}-desktop`
        );

        const banner = await BannerModel.create({
            title: title.trim(),
            shortdes: shortdes.trim(),
            tag: tag.trim(),
            link: link.trim(),
            desktopImg: desktopResult.secure_url,
            mobileImg: mobileResult.secure_url,
            status: status
        });

        return res.status(201).json({
            success: true,
            message: "Banner added successfully",
            banner
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getBannerByAdmin = async (req, res) => {
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

        const [banners, total] = await Promise.all([
            BannerModel.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            BannerModel.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            banners,
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

export const getBannerByUser = async (req, res) => {
    try {
        const banners = await BannerModel.find({
            status: true
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            banners
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const {title,shortdes,tag,link,status} = req.body;

        if(!id){
            return res.status(400).json({success:false, message: "Id is required"})
        }

        const banner = await BannerModel.findById(id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        if (title?.trim()) {
            banner.title = title.trim();
        }

        if (shortdes?.trim()) {
            banner.shortdes = shortdes.trim();
        }

        if (tag?.trim()) {
            banner.tag = tag.trim();
        }

        if (link?.trim()) {
            banner.link = link.trim();
        }

        if (status !== undefined) {
            banner.status = status
        }

        const mobile = req.files?.mobileImg?.[0];
        const desktop = req.files?.desktopImg?.[0];

        if (mobile) {
            const oldMobileImage = banner.mobileImg;

            const mobileResult = await uploadToCloudinary(
                mobile.buffer,
                `${banner.title}-mobile`
            );

            banner.mobileImg = mobileResult.secure_url;

            if (oldMobileImage) {
                try {
                    await deleteFromCloudinary(oldMobileImage);
                } catch (error) {
                    console.log(
                        "Old mobile image delete failed:",
                        error.message
                    );
                }
            }
        }

        if (desktop) {
            const oldDesktopImage = banner.desktopImg;

            const desktopResult = await uploadToCloudinary(
                desktop.buffer,
                `${banner.title}-desktop`
            );

            banner.desktopImg = desktopResult.secure_url;

            if (oldDesktopImage) {
                try {
                    await deleteFromCloudinary(oldDesktopImage);
                } catch (error) {
                    console.log(
                        "Old desktop image delete failed:",
                        error.message
                    );
                }
            }
        }

        await banner.save();

        return res.status(200).json({
            success: true,
            message: "Banner updated successfully",
            banner
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        if(!id){
            return res.status(400).json({success:false, message: "Id is required"})
        }

        const banner = await BannerModel.findById(id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        if (banner.mobileImg) {
            try {
                await deleteFromCloudinary(
                    banner.mobileImg
                );
            } catch (error) {
                console.log(
                    "Mobile image delete failed:",
                    error.message
                );
            }
        }

        if (banner.desktopImg) {
            try {
                await deleteFromCloudinary(
                    banner.desktopImg
                );
            } catch (error) {
                console.log(
                    "Desktop image delete failed:",
                    error.message
                );
            }
        }

        await BannerModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Banner deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};