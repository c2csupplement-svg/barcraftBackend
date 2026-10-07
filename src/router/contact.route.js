import { Router } from "express";
import {addContact, deleteContact, updateContactStatus, getContactsByAdmin} from "../controllers/contact.controller.js";

const router = Router();

router.route("/").post(addContact);
router.route("/:id").put(updateContactStatus);
router.route("/:id").delete(deleteContact);
router.route("/dashboard").get(getContactsByAdmin);

export default router;