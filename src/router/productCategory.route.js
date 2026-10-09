import { Router } from "express";
import {addProductCategory, updateProductCategory, updateProductCategoryStatus, deleteProductCategory, getProductCategory, getProductCategoryAdmin} from "../controllers/productCategory.controller.js"
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.route("/").post(upload.fields([
    { name: "mobileImg", maxCount: 1 },
    { name: "desktopImg", maxCount: 1}
]), addProductCategory);

router.route("/:id").put(upload.fields([
    { name: "mobileImg", maxCount: 1 },
    { name: "desktopImg", maxCount: 1}
]), updateProductCategory);

router.route("/status/:id").post(updateProductCategoryStatus);
router.route("/:id").delete(deleteProductCategory);
router.route("/dashboard").get(getProductCategoryAdmin);
router.route("/").get(getProductCategory);

export default router