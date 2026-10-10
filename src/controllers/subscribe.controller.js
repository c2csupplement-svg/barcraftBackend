import SubscribeModel from "../models/subscribe.model";

export const subscribe = async (req, res) => {
    try{
        const {email} = req.body;

        const duplicateEmail = await SubscribeModel.findOne({email:email});

        if(duplicateEmail){
            return res.status(400).json({success:true, message:"Already Subscribe."});
        }

        await SubscribeModel.create({email:email});

        return res.status(200).json({success:true, message:"Subscribe successfully."});
    }
    catch(err){
        return res.status(500).json({success:false, message: err.message})
    }
}

export const updateStatus = async(req,res) => {
    try{
        const {id} = req.params;

        if(!id?.trim()){
            return res.status(400).json({success:false, message:"User Id is required"})
        }

        const userDetails = await SubscribeModel.findById(id);

        if(!userDetails){
            return res.status(404).json({success:false, message:"User not found"});
        }

        userDetails.status = !userDetails.status;

        return res.status(200).json({success:true, message: "Status update successfully."})
    }
    catch(err){
        return res.status(500).json({success:false, message: err.message})
    }
}

export const getSubscribe = async (req, res) => {
    try{
        const page = Math.max(parseInt(req.query.page) || 1,1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);

        const skip = (page-1)*limit;

        const [subscribe, total] = await Promise.all([
            SubscribeModel.find()
            .sort({createdAt:-1})
            .skip(skip)
            .limit(limit),

            SubscribeModel.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            message: "Subscribe fetched successfully.",
            count: subscribe.length,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            subscribe
        });
    }
    catch(err){
        return res.status(500).json({success:false, message: err.message})
    }
}