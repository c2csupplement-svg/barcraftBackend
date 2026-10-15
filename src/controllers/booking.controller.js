import mongoose from "mongoose";
import BookingModel from "../models/booking.model.js";

const BOOKING_STATUS = ["Processing", "Confirm", "Done", "Cancelled", "Reject"];
const MAX_LIMIT = 100;

const toStr = (value) => (value === undefined || value === null ? "" : String(value).trim());

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPagination = (query) => {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), MAX_LIMIT);
    return { page, limit, skip: (page - 1) * limit };
};

export const bookingRegister = async (req, res) => {
    try{
        const body = req.body || {};
        const {flavour, addon} = body;
        const name = toStr(body.name);
        const phone = toStr(body.phone);
        const venue = toStr(body.venue);
        const address = toStr(body.address);
        const guestNumber = toStr(body.guestNumber);
        const date = toStr(body.date);
        const email = toStr(body.email);

        if(!name || !phone || !venue || !address || !guestNumber || !date || !email){
            return res.status(400).json({success:false, message:"Send Required Informations."});
        }

        if(!Array.isArray(flavour) || flavour.length === 0 || flavour.length > 4 || !flavour.every((f) => typeof f === "string" && f.trim())){
            return res.status(400).json({success:false, message: "Choose atleast one and less than 5 flavours."});
        };

        await BookingModel.create({
            name,
            phone,
            venue,
            address,
            guestNumber,
            date,
            email,
            flavour: flavour.map((f) => f.trim()),
            addon: Array.isArray(addon) ? addon.filter((a) => typeof a === "string" && a.trim()).map((a) => a.trim()) : [],
        });

        return res.status(201).json({success:true, message: "Registration successfully, our team contact you soon."})
    }
    catch(err){
        return res.status(500).json({success:false, message: err.message});
    }
}

export const updateBookingStatus = async (req, res) => {
    try{
        const {id} = req.params;
        const {status} = req.body || {};

        if(!id || !status){
            return res.status(400).json({success:false, message:"Booking Id and status both are required."});
        }

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({success:false, message:"Invalid booking id."});
        }

        if(!BOOKING_STATUS.includes(status)){
            return res.status(400).json({success:false, message:`Status must be one of: ${BOOKING_STATUS.join(", ")}`});
        }

        const bookingDetails = await BookingModel.findById(id);

        if(!bookingDetails){
            return res.status(404).json({success:false, message:"Booking not found"});
        }

        bookingDetails.status = status;

        await bookingDetails.save();

        return res.status(200).json({success:true, message:"Status update successfully"});
    }
    catch(err){
        return res.status(500).json({success:false, message: err.message});
    }
}

export const getBooking = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req.query);

        const [bookings, total] = await Promise.all([
            BookingModel.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            BookingModel.countDocuments()
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            count: bookings.length,
            total,
            page,
            limit,
            totalPages,
            bookings
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const deleteBooking = async (req, res) => {
    try{
        const {id} = req.params;

        if(!id){
            return res.status(400).json({success:false, message: "Booking id is required"});
        };

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({success:false, message:"Invalid booking id."});
        }

        const deleteBookingDetails = await BookingModel.findByIdAndDelete(id);

        if(!deleteBookingDetails){
            return res.status(404).json({success:false, message:"Booking not found"});
        }

        return res.status(200).json({success:true, message: "Booking Delete Successfully"})
    }
    catch(err){
        return res.status(500).json({success:false, message: err.message})
    }
}

export const searchBooking = async (req, res) => {
    try {
        const { q } = req.query;

        if (typeof q !== "string" || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required."
            });
        }

        const search = escapeRegex(q.trim());

        const { page, limit, skip } = getPagination(req.query);

        const searchQuery = {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { venue: { $regex: search, $options: "i" } },
                { address: { $regex: search, $options: "i" } },
                { date: { $regex: search, $options: "i" } }
            ]
        };

        const [bookings, total] = await Promise.all([
            BookingModel.find(searchQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            BookingModel.countDocuments(searchQuery)
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            count: bookings.length,
            total,
            page,
            limit,
            totalPages,
            bookings
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};