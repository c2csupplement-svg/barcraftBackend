import { Router } from "express";
import {addProduct, updateProduct, deleteProduct, 
    getProduct, getProductByAdmin, getProductBySlug, updateProductStatus,
    searchProducts,searchProductsByAdmin
} from "../controllers/product.controller.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.route("/dashboard").get(getProductByAdmin)
router.route("/").post(upload.fields([
    { name: "featureImage", maxCount: 1 },
    { name: "image", maxCount: 4 },
]), addProduct);
router.route("/:id").put(upload.fields([
    { name: "featureImage", maxCount: 1 },
    { name: "image", maxCount: 4 },
]), updateProduct);
router.route("/status/:id").patch(updateProductStatus)
router.route("/:id").delete(deleteProduct);
router.route("/dashboard/search").get(searchProductsByAdmin);
router.route("/search").get(searchProducts);
router.route("/:slug").get(getProductBySlug);
router.route("/").get(getProduct);

export default router;