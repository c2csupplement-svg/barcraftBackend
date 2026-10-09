import RecipeSubCategoryModel from "../models/recipeSubcategory.model.js";
import RecipeModel from "../models/recipe.model.js";
import RecipeCategoryModel from "../models/recipeCategory.model.js";

export const createRecipeCategory = async (req, res) => {
    try {
        const { categoryId, name, slug, shortdes, point, seo, status } = req.body;

        if (!name.trim() || !slug.trim() || !shortdes.trim()) {
            return res.status(400).json({ success: false, message: "Name, slug and description is required." });
        };

        if (point?.length === 0) {
            return res.status(400).json({ success: false, message: "Atleast one point send." });
        }

        let parseSeo = seo;

        if (typeof (seo) === "String") {
            parseSeo = JSON.parse(seo)
        };

        const checkCategory = await RecipeCategoryModel.findById(categoryId);

        if (!checkCategory) {
            return res.status(400).json({ success: false, message: "Category not found" });
        }

        const duplicateCategory = await RecipeSubCategoryModel.findOne({ slug: slug });

        if (duplicateCategory) {
            return res.status(400).json({ success: false, message: "Duplicate slug" });
        }

        await RecipeSubCategoryModel.create({
            name: name.trim(),
            slug: slug.trim(),
            shortdes: shortdes.trim(),
            seo: parseSeo,
            status: status
        })

        return res.status(200).json({ success: true, message: "Recipe Category create succcessfully." });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

export const updateRecipeCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const { categoryId, name, slug, shortdes, point, seo, status } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Category Id is required." })
        }

        const categoryDetails = await RecipeSubCategoryModel.findById(id);

        if (!categoryDetails) {
            return res.status(404).json({ success: false, message: "Category not found" });
        };

        if (categoryId.trim()) {
            const checkCategory = await RecipeCategoryModel.findById(categoryId);

            if (!checkCategory) {
                return res.status(400).json({ success: false, message: "Category not found" });
            }

            categoryDetails.categoryId = categoryId.trim();
        }

        if (name.trim()) {
            categoryDetails.name = name.trim();
        };
        if (slug.trim()) {
            categoryDetails.slug = slug.trim();
        };
        if (shortdes.trim()) {
            categoryDetails.shortdes = shortdes.trim();
        };
        if (point.length > 0) {
            categoryDetails.point = point
        }
        if (Object.keys(seo).length > 0) {
            categoryDetails.seo = seo
        };
        if (status.trim()) {
            categoryDetails.status = status.trim()
        }

        await categoryDetails.save();

        return res.status(200).json({ success: true, message: "Category update successfully." });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

export const updateStatusRecipeCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id.trim()) {
            return res.status(400).json({ success: false, message: "CategoryId is required" });
        }

        const categoryDetails = await RecipeSubCategoryModel.findById(id);

        if (!categoryDetails) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        categoryDetails.status = !categoryDetails.status;

        await categoryDetails.save();

        return res.status(200).json({ success: false, message: "Category status update successfully." });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

export const deleteRecipeCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: "CategoryId is required." });
        }

        const categoryBelongStatus = await RecipeModel.findOne({ categoryId: id });

        if (categoryBelongStatus) {
            return res.status(400).json({ success: false, message: "Category is Belong with some recipe" });
        }

        const deleteCategoryStatus = await RecipeSubCategoryModel.findByIdAndDelete(id);

        if (!deleteCategoryStatus) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }

        return res.status(200).json({ success: true, message: "Category delete successfully." });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

export const getRecipeCategoryByAdmin = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);

        const skip = (page - 1) * limit;

        const [category, total] = await Promise.all([
            RecipeSubCategoryModel.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            RecipeSubCategoryModel.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            query,
            category,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

export const getRecipeCategory = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);

        const skip = (page - 1) * limit;

        const [category, total] = await Promise.all([
            RecipeSubCategoryModel.find({ status: true })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            RecipeSubCategoryModel.countDocuments({ status: true })
        ]);

        return res.status(200).json({
            success: true,
            query,
            category,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}