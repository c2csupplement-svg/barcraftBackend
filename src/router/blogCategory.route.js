import { Router } from "express";
import multer from "multer";
import {createCategory, updateCategory, deleteCategory, 
    getCategories, getCategoriesByAdmin, getCategoryById} from "../controllers/blogCategory.controller.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.route("/").post(upload.fields([
    { name: "image", maxCount: 1},
]), createCategory);
router.route("/:id").put(upload.fields([
    { name: "image", maxCount: 1},
]), updateCategory);
router.route("/:id").delete(deleteCategory);
router.route("/").get(getCategories);
router.route("/dashboard").get(getCategoriesByAdmin);
router.route("/:id").get(getCategoryById);

export default router