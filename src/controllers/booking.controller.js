import BookingModel from "../models/booking.model.js";

export const bookingRegister = async (req, res) => {
    try{
        const {name, phone, venue, address, guestNumber, date, email, flavour, addon, status} = req.body;

        if(!name.trim() || !phone.trim() || !venue.trim() || !address.trim() || !guestNumber.trim() || !date.trim() || !email.trim()){
            return res.status(400).json({success:false, message:"Send Required Informations."});
        }

        if(flavour.length === 0 || flavour.length > 4){
            return res.status(400).json({success:false, message: "Choose atleast one and less than 5 flavours."});
        };

        await BookingModel.create({
            name:name.trim(),
            phone:phone.trim(),
            venue: venue.trim(),
            address: address.trim(),
            guestNumber: guestNumber.trim(),
            date:date.trim(),
            flavour:flavour,
            addon:addon,
            status:status
        });

        return res.status(200).json({success:true, message: "Registration successfully, our team contact you soon."})
    }
    catch(err){
        return res.status(500).json({success:false, message: err.message});
    }
}

export const updateBookingStatus = async (req, res) => {
    try{
        const {id} = req.params;
        const {status} = req.body;

        if(!id || !status){
            return res.status(400).json({success:false, message:"Booking Id and status both are required."});
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
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);

        const skip = (page - 1) * limit;

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

        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required."
            });
        }

        const search = q.trim();

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);

        const skip = (page - 1) * limit;

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