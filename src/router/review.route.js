import { Router } from "express";
import {addReview} from "../controllers/review.controller.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.route("/:id").post(upload.fields([{ name: "image", maxCount: 4 }]), addReview);

export default router;