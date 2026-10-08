import { Router } from "express";
import {addProduct} from "../controllers/product.controller.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.route("/").post(upload.fields([
    { name: "featureImage", maxCount: 1 },
    { name: "image", maxCount: 1 },
]), addProduct);

export default router;