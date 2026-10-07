import {Router} from "express"
import {addInstagramPost, updateInstagramPost, deleteInstagramPost, 
    getInstagramPostsByAdmin, getInstagramPostsByUser} from "../controllers/instagram.controller.js";

const router = Router();

router.route("/").post(addInstagramPost);
router.route("/:id").put(updateInstagramPost);
router.route("/:id").delete(deleteInstagramPost);
router.route("/dashboard").get(getInstagramPostsByAdmin);
router.route("/").get(getInstagramPostsByUser);

export default router;