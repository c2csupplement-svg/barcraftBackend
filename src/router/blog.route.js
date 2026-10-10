import { Router } from "express";
import multer from "multer";
import {createBlog, updateBlog, deleteBlog, getBlogBySlug, getBlogs, getBlogsByAdmin, searchBlogs, getBlogByCategory} from "../controllers/blog.controller.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.route("/").post(upload.fields([
    { name: "image", maxCount: 1},
]), createBlog);
router.route("/:id").put(upload.fields([
    { name: "image", maxCount: 1},
]), updateBlog);
router.route("/:id").delete(deleteBlog);
router.route("/dashboard").get(getBlogsByAdmin);
router.route("/search").get(searchBlogs);
router.route("/").get(getBlogs);
router.route("/:slug").get(getBlogBySlug);
router.route("/category/:id").get(getBlogByCategory);

export default router
