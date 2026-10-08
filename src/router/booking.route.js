import { Router } from "express";
import {bookingRegister,updateBookingStatus, getBooking, deleteBooking} from "../controllers/booking.controller.js";

const router = Router();

router.route("/").post(bookingRegister);
router.route("/").get(getBooking);
router.route("/:id").patch(updateBookingStatus);
router.route("/:id").delete(deleteBooking);

export default router;