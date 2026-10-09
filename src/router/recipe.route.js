import { Router } from "express";
import {createRecipe, getRecipeBySlug, getRecipes, getRecipesByAdmin, updateRecipe, updateStatus, deleteRecipe, filter} from "../controllers/recipe.controller.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.route("/").post(upload.fields([{ name: "image", maxCount: 1 },]), createRecipe);
router.route("/:id").put(upload.fields([{ name: "image", maxCount: 1 },]), updateRecipe);
router.route("/:id").delete(deleteRecipe);
router.route("/status/:id").patch(updateStatus);
router.route("/dashboard").get(getRecipesByAdmin);
router.route("/").get(getRecipes);
router.route("/:slug").get(getRecipeBySlug);

export default router;