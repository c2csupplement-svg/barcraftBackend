import FaqModel from "../models/faq.model.js";

export const addFaq = async (req, res) => {
    try {
        const { question, answer, status } = req.body;

        if (!question?.trim() || !answer?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question and Answer both are required"
            });
        }

        const faq = await FaqModel.create({
            question: question.trim(),
            answer: answer.trim(),
            status: status          
        });

        return res.status(201).json({
            success: true,
            message: "FAQ added successfully",
            faq
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getFaqByAdmin = async (req, res) => {
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

        const [faqs, total] = await Promise.all([
            FaqModel.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            FaqModel.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            faqs,
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

export const getFaqByUser = async (req, res) => {
    try {
        const faqs = await FaqModel.find({
            status: true
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            faqs
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const updateFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const {question,answer,status} = req.body;

        if(!id){
            return res.status(400).json({success:false, message: "Id is required"})
        }

        const faq = await FaqModel.findById(id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: "FAQ not found"
            });
        }

        if (question !== undefined) {
            if (!question.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Question is required"
                });
            }

            faq.question = question.trim();
        }

        if (answer !== undefined) {
            if (!answer.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Answer is required"
                });
            }

            faq.answer = answer.trim();
        }

        if (status !== undefined) {
            faq.status =
                status === true ||
                status === "true";
        }

        await faq.save();

        return res.status(200).json({
            success: true,
            message: "FAQ updated successfully",
            faq
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const deleteFaq = async (req, res) => {
    try {
        const { id } = req.params;

        if(!id){
            return res.status(400).json({success:false, message: "Id is required"})
        }

        const faq = await FaqModel.findById(id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: "FAQ not found"
            });
        }

        await FaqModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "FAQ deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};