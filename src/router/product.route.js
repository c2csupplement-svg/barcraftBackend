import { Router } from "express";
import {addProduct, updateProduct, updateProductStatus, deleteProduct, getProductByAdmin, getProduct, getProuctBySlug, getProductbyCategoryId, getProductByCategorySlug, searchProduct} from "../controllers/product.controller.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.route("/").post(upload.fields([
    { name: "featureImage", maxCount: 1 },
    { name: "image", maxCount: 1},
    {name: "bottle", maxCount:1}
]), addProduct);

router.route("/:id").put(upload.fields([
    { name: "featureImage", maxCount: 1 },
    { name: "image", maxCount: 1},
    {name: "bottle", maxCount:1}
]), updateProduct);

router.route("/status/:id").patch(updateProductStatus);
router.route("/:id").delete(deleteProduct);
router.route("/dashboard").get(getProductByAdmin);
router.route("/").get(getProduct);
router.route("/category/slug/:slug").get(getProductByCategorySlug)
router.route("/category/:id").get(getProductbyCategoryId);
router.route("/:slug").get(getProuctBySlug);
router.route("/search").get(searchProduct)


export default router;