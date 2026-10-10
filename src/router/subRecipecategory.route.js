import { Router } from "express";
import {createRecipeCategory, updateRecipeCategory, updateStatusRecipeCategory, deleteRecipeCategory,
    getRecipeCategory, getRecipeCategoryByAdmin
} from "../controllers/subRecipeCategory.controller.js";

const router = Router();

router.route("/").post(createRecipeCategory);
router.route("/:id").put(updateRecipeCategory);
router.route("/status/:id").patch(updateStatusRecipeCategory);
router.route("/:id").delete(deleteRecipeCategory);
router.route("/dashboard").get(getRecipeCategoryByAdmin);
router.route("/").get(getRecipeCategory);

export default router;