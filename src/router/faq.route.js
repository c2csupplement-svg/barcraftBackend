import { Router } from "express";
import {addFaq,updateFaq,deleteFaq, getFaqByAdmin, getFaqByUser} from "../controllers/faq.controller.js";

const router = Router();

router.route("/").post(addFaq);
router.route("/:id").put(updateFaq);
router.route("/:id").delete(deleteFaq);
router.route("/dashboard").get(getFaqByAdmin);
router.route("/").get(getFaqByUser);

export default router;