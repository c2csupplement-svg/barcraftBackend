import {Router} from "express";
import multer from "multer";
import {createBanner, updateBanner, deleteBanner, getBannerByAdmin, getBannerByUser} from "../controllers/banner.controller.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.route("/").post(upload.fields([
    { name: "mobileImg", maxCount: 1},
    { name: "desktopImg", maxCount: 1}
]), createBanner);
router.route("/:id").put(upload.fields([
    { name: "mobileImg", maxCount: 1},
    { name: "desktopImg", maxCount: 1}
]), updateBanner);
router.route("/:id").delete(deleteBanner);
router.route("/dashboard").get(getBannerByAdmin);
router.route("/").get(getBannerByUser);

export default router;