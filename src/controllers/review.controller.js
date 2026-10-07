import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import ProductModel from "../models/product.model.js";

export const addReview = async (req, res) => {
    try {
        const { name, des, rating } = req.body;
        const { id } = req.params;

        const images = req.files?.image || [];

        if (!name?.trim() || !des?.trim() || !rating) {
            return res.status(400).json({
                success: false,
                message: "Send all required values"
            });
        }

        let imageResult = [];

        if (images.length > 0) {
            imageResult = await Promise.all(
                images.map(async (image) => {
                    const result = await uploadToCloudinary(
                        image.buffer,
                        name
                    );

                    return result.secure_url;
                })
            );
        }

        const productDetails = await ProductModel.findByIdAndUpdate(
            id,
            {
                $push: {
                    review: {
                        name: name.trim(),
                        des: des.trim(),
                        rating: String(rating),
                        image: imageResult
                    }
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!productDetails) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Review added successfully",
            review: productDetails.review
        });

    } catch (err) {
        console.error("Add Review Error:", err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};