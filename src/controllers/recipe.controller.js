
import RecipeModel from "../models/recipe.model.js";
import RecipeSubCategoryModel from "../models/recipeSubcategory.model.js";
import RecipeCategoryModel from "../models/recipeCategory.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const parseJSON = (value, defaultValue) => {
    if (value === undefined || value === null || value === "") {
        return defaultValue;
    }

    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            return defaultValue;
        }
    }

    return value;
};

const getCloudinaryPublicId = (image) => {
    if (!image) return null;

    if (typeof image === "object" && image.public_id) {
        return image.public_id;
    }

    if (typeof image === "string") {
        const match = image.match(
            /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/
        );

        return match ? match[1] : null;
    }

    return null;
};

export const createRecipe = async (req, res) => {
    let uploadedImage;

    try {
        const { categoryId, name, slug, ingredient, makingstep, seo, status } = req.body;

        const image = req.files?.image?.[0];

        if (!categoryId?.trim() || !name?.trim() || !slug?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category, name and slug are required."
            });
        }

        if (!image) {
            return res.status(400).json({
                success: false,
                message: "Recipe image is required."
            });
        }

        const ingredients = parseJSON(ingredient, []);
        const makingSteps = parseJSON(makingstep, []);
        const seoData = parseJSON(seo, {});

        if (!Array.isArray(ingredients) || ingredients.length === 0 || !Array.isArray(makingSteps) || makingSteps.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Ingredients and making steps are required."
            });
        }

        const category = await RecipeSubCategoryModel.findById(
            categoryId?.trim()
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Subcategory not found."
            });
        }

        const duplicateSlug = await RecipeModel.findOne({
            slug: slug?.trim()
        });

        if (duplicateSlug) {
            return res.status(409).json({
                success: false,
                message: "Duplicate slug."
            });
        }

        uploadedImage = await uploadToCloudinary(
            image.buffer,
            `${name?.trim()}-image`
        );

        const recipe = await RecipeModel.create({
            categoryId: categoryId?.trim(),
            name: name?.trim(),
            slug: slug?.trim(),
            image: uploadedImage.secure_url,
            ingredient: ingredients,
            makingstep: makingSteps,
            seo: seoData,
            status
        });

        return res.status(201).json({
            success: true,
            message: "Recipe created successfully.",
            recipe
        });
    } catch (err) {
        if (uploadedImage) {
            try {
                const publicId = getCloudinaryPublicId(uploadedImage);
                if (publicId) await deleteFromCloudinary(publicId);
            } catch (deleteError) {
                console.error("Cloudinary cleanup failed:", deleteError.message);
            }
        }

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getRecipes = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );

        const search = req.query.search?.trim();
        const categoryId = req.query.categoryId;
        const status = req.query.status;

        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { slug: { $regex: search, $options: "i" } },
                {status: true}
            ];
        }

        if (categoryId) {
            filter.categoryId = categoryId;
        }

        if (status !== undefined && status !== "") {
            filter.status = status;
        }

        const [recipes, total] = await Promise.all([
            RecipeModel.find(filter)
                .populate("categoryId")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            RecipeModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            message: "Recipes fetched successfully.",
            count: recipes.length,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            recipes
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getRecipesByAdmin = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );

        const search = req.query.search?.trim();
        const categoryId = req.query.categoryId;
        const status = req.query.status;

        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { slug: { $regex: search, $options: "i" } }
            ];
        }

        if (categoryId) {
            filter.categoryId = categoryId;
        }

        if (status !== undefined && status !== "") {
            filter.status = status;
        }

        const [recipes, total] = await Promise.all([
            RecipeModel.find(filter)
                .populate("categoryId")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            RecipeModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            message: "Recipes fetched successfully.",
            count: recipes.length,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            recipes
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getRecipeBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        if (!slug?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Recipe slug is required."
            });
        }

        const recipe = await RecipeModel.findOne({slug:slug})
            .populate("categoryId");

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: "Recipe not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Recipe fetched successfully.",
            recipe
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const updateRecipe = async (req, res) => {
    let uploadedImage;

    try {
        const { id } = req.params;

        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid recipe ID is required."
            });
        }

        const recipe = await RecipeModel.findById(id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: "Recipe not found."
            });
        }

        const { categoryId, name, slug, ingredient, makingstep, seo, status } = req.body;

        const updateData = {};

        if (categoryId !== undefined) {
            if (!categoryId?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Category ID cannot be empty."
                });
            }

            const category = await RecipeSubCategoryModel.findById(
                categoryId?.trim()
            );

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Subcategory not found."
                });
            }

            updateData.categoryId = categoryId?.trim();
        }

        if (name !== undefined) {
            if (!name?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot be empty."
                });
            }

            updateData.name = name?.trim();
        }

        if (slug !== undefined) {
            if (!slug?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Slug cannot be empty."
                });
            }

            const duplicateSlug = await RecipeModel.findOne({
                slug: slug?.trim(),
                _id: { $ne: id }
            });

            if (duplicateSlug) {
                return res.status(409).json({
                    success: false,
                    message: "Duplicate slug."
                });
            }

            updateData.slug = slug?.trim();
        }

        if (ingredient !== undefined) {
            const ingredients = parseJSON(ingredient, null);

            if (!Array.isArray(ingredients) || ingredients.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Ingredients must be a non-empty array."
                });
            }

            updateData.ingredient = ingredients;
        }

        if (makingstep !== undefined) {
            const makingSteps = parseJSON(makingstep, null);

            if (!Array.isArray(makingSteps) || makingSteps.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Making steps must be a non-empty array."
                });
            }

            updateData.makingstep = makingSteps;
        }

        if (seo !== undefined) {
            const seoData = parseJSON(seo, null);

            if (
                !seoData ||
                typeof seoData !== "object" ||
                Array.isArray(seoData)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid SEO data."
                });
            }

            updateData.seo = seoData;
        }

        if (status !== undefined) {
            updateData.status = status;
        }

        const image = req.files?.image?.[0];

        if (image) {
            uploadedImage = await uploadToCloudinary(
                image.buffer,
                `${updateData.name || recipe.name}-image`
            )?.secure_url;

            updateData.image = uploadedImage;
        }

        const updatedRecipe = await RecipeModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate("categoryId");

        if (image && recipe.image) {
            try {
                const oldPublicId = recipe.image;

                if (oldPublicId) {
                    await deleteFromCloudinary(oldPublicId);
                }
            } catch (deleteError) {
                console.error(
                    "Old image deletion failed:",
                    deleteError.message
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: "Recipe updated successfully.",
            recipe: updatedRecipe
        });
    } catch (err) {
        if (uploadedImage) {
            try {
                const publicId = getCloudinaryPublicId(uploadedImage);
                if (publicId) await deleteFromCloudinary(publicId);
            } catch (deleteError) {
                console.error("Cloudinary cleanup failed:", deleteError.message);
            }
        }

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Valid recipe ID is required."
            });
        }

        const recipe = await RecipeModel.findById(id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: "Recipe not found."
            });
        }

        await RecipeModel.findByIdAndDelete(id);

        if (recipe.image) {
            try {
                const publicId = getCloudinaryPublicId(recipe.image);

                if (publicId) {
                    await deleteFromCloudinary(publicId);
                }
            } catch (deleteError) {
                console.error(
                    "Cloudinary image deletion failed:",
                    deleteError.message
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: "Recipe deleted successfully."
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const filter = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);
        const skip = (page - 1) * limit;

        const { category, glassware, spirits } = req.body;

        const query = {};

        if (category) {
            const searchReg = new RegExp(category, "i");

            const subCategories = await RecipeSubCategoryModel.find({
                $or: [
                    { name: searchReg },
                    { slug: searchReg }
                ]
            }).select("_id");

            const subCategoryIds = subCategories.map(item => item._id);

            if (subCategoryIds.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "No recipes found",
                    recipes: [],
                    page,
                    limit,
                    total: 0,
                    totalPages: 0
                });
            }

            query.categoryId = { $in: subCategoryIds };
        }

        if (glassware || spirits) {
            const ingredientConditions = [];

            if (glassware) {
                ingredientConditions.push(
                    new RegExp(glassware, "i")
                );
            }

            if (spirits) {
                ingredientConditions.push(
                    new RegExp(spirits, "i")
                );
            }

            query.ingredient = {
                $all: ingredientConditions
            };
        }

        query.status = true;

        const [recipes, total] = await Promise.all([
            RecipeModel.find(query)
                .populate("categoryId", "name slug")
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),

            RecipeModel.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            message: "Recipes filtered successfully",
            recipes,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });

    } catch (err) {
        console.error("Recipe filter error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const updateStatus = async (req, res) => {
    try{
        const {id} = req.params;

        if(!id?.trim()){
            return res.status(400).json({success:false, message: "RecipeId is required."});
        }

        const recipeDetails = await RecipeModel.findById(id);

        if(!recipeDetails){
            return res.status(404).json({success:false, message: "Recipe not found."});
        }

        recipeDetails.status = !recipeDetails.status;

        await recipeDetails.save();

        return res.status(200).json({success:true, message: "Recipe status update successfully."});
    }
    catch(err){
        return res.status(500).json({success:false, message: err.message});
    }
}
