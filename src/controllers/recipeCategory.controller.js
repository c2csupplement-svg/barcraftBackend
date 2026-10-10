import RecipeCategoryModel from "../models/recipeCategory.model.js";
import RecipeSubCategoryModel from "../models/recipeSubcategory.model.js";
import RecipeModel from "../models/recipe.model.js"

export const createRecipeCategory = async (req, res) => {
    try {
        const { name, slug, shortdes, point, seo, status } = req.body;

        if (!name?.trim() || !slug?.trim() || !shortdes?.trim()) {
            return res.status(400).json({ success: false, message: "Name, slug and description is required." });
        };

        if (!point || point?.length === 0) {
            return res.status(400).json({ success: false, message: "Atleast one point send." });
        }

        let parseSeo = seo;

        if (typeof (seo) === "String") {
            parseSeo = JSON.parse(seo)
        };

        const duplicateCategory = await RecipeCategoryModel.findOne({ slug: slug });

        if (duplicateCategory) {
            return res.status(400).json({ success: false, message: "Duplicate slug" });
        }

        await RecipeCategoryModel.create({
            name: name?.trim(),
            slug: slug?.trim(),
            shortdes: shortdes?.trim(),
            point:point,
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

        const { name, slug,shortdes,point, seo,status
        } = req.body ?? {};

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Category Id is required."
            });
        }

        const categoryDetails = await RecipeCategoryModel.findById(id);

        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        if (typeof name === "string" && name.trim()) {
            categoryDetails.name = name.trim();
        }

        if (typeof slug === "string" && slug.trim()) {
            categoryDetails.slug = slug.trim();
        }

        if (typeof shortdes === "string") {
            categoryDetails.shortdes = shortdes.trim();
        }

        if (Array.isArray(point)) {
            categoryDetails.point = point
                .map((item) => String(item ?? "").trim())
                .filter(Boolean);
        }

        if ( seo &&typeof seo === "object" && !Array.isArray(seo) && Object.keys(seo).length > 0 ) {
            categoryDetails.seo = seo;
        }

        if (typeof status === "boolean") {
            categoryDetails.status = status;
        }

        await categoryDetails.save();

        return res.status(200).json({
            success: true,
            message: "Category updated successfully.",
            data: categoryDetails
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const updateStatusRecipeCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id?.trim()) {
            return res.status(400).json({ success: false, message: "CategoryId is required" });
        }

        const categoryDetails = await RecipeCategoryModel.findById(id);

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

        const categoryBelongStatus = await RecipeSubCategoryModel.findOne({ categoryId: id });

        if (categoryBelongStatus) {
            return res.status(400).json({ success: false, message: "Category is Belong with some recipe" });
        }

        const deleteCategoryStatus = await RecipeCategoryModel.findByIdAndDelete(id);

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

        const [category, countResult] = await Promise.all([
            RecipeCategoryModel.aggregate([
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: RecipeSubCategoryModel.collection.name,
                        localField: "_id",
                        foreignField: "categoryId",
                        as: "subcategories"
                    }
                },
                {
                    $addFields: {
                        subcategoryCount: {
                            $size: "$subcategories"
                        }
                    }
                }
            ]),
            RecipeCategoryModel.aggregate([
                {
                    $count: "total"
                }
            ])
        ]);

        const total = countResult[0]?.total || 0;

        return res.status(200).json({
            success: true,
            category,
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

export const getRecipeCategory = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);

        const skip = (page - 1) * limit;

        const [category, total] = await Promise.all([
            RecipeCategoryModel.find({ status: true })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            RecipeCategoryModel.countDocuments({ status: true })
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

export const getRecipeByCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);

        const skip = (page - 1) * limit;

        if (!id?.trim()) {
            return res.status(400).json({ success: false, message: "CategoryId are required." });
        }

        const subcategory = await RecipeSubCategoryModel.find({ categoryId: id });

        if (subcategory.length === 0) {
            return res.status(404).json({ success: false, message: "No Recipe Found" });
        };

        const subCategoryIds = subcategory.map(categoryId => categoryId._id)

        const [recipes, total] = await Promise.all([
            RecipeModel.find({ categoryId: { $in: subCategoryIds } })
                .populate("categoryId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            RecipeModel.countDocuments({ categoryId: { $in: subCategoryIds } })
        ]);

        return res.status(200).json({
            success: true,
            query,
            recipes,
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