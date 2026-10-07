import ContactModel from "../models/contact.model.js";


export const addContact = async (req, res) => {
    try {
       const {name, email, phone, subject, message} = req.body;


        if (!name?.trim() ||!email?.trim() ||!phone?.trim() ||!subject?.trim() || !message?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Send required variable value"
            });
        }

        const contact = await ContactModel.create({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            subject: subject.trim(),
            message: message.trim()
        });

        return res.status(201).json({
            success: true,
            message: "We will contact you soon",
            contact
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getContactsByAdmin = async (req, res) => {
    try {
        const page = Math.max(
            parseInt(req.query.page) || 1,
            1
        );

        const limit = Math.max(
            parseInt(req.query.limit) || 20,
            1
        );

        const skip = (page - 1) * limit;

        const [contacts, total] = await Promise.all([
            ContactModel.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            ContactModel.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            contacts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        if(!id){
            return res.status(400).json({success:false, message: "Id is required"})
        }

        const contact = await ContactModel.findById(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        await ContactModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Contact deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(req.body)
        const { status } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ContactId is required",
            });
        }

        if (status === "" ) {
            return res.status(400).json({
                success: false,
                message: "Status is required",
            });
        }

        const contactDetails = await ContactModel.findByIdAndUpdate(
            id,
            { status },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!contactDetails) {
            return res.status(404).json({
                success: false,
                message: "Contact not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Status updated successfully",
            contact: contactDetails,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};