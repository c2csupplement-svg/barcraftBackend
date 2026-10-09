import ProductCategoryModel from "../models/productCategory.model.js";
import ProductModel from "../models/product.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"

export const addProductCategory = async (req, res) => {
    try {
        const { name, slug, shortdes, status } = req.body;

        const mobile = req.files?.mobileImg?.[0];
        const desktop = req.files?.desktopImg?.[0];

        if (!name.trim() || !shortdes.trim() || !slug.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name and Short Description both required."
            })
        }

        if (!mobile || !desktop) {
            return res.status(400).json({
                success: false,
                message: "Mobile and Desktop categoryDetails images are both required"
            });
        };


         const productCategory = await ProductCategoryModel.findOne({slug:slug});

         if(productCategory){
            return res.status(400).json({success:false, message: "Duplicate Slug"});
         }

        const mobileResult = await uploadToCloudinary(
            mobile.buffer,
            `${title.trim()}-mobile`
        );

        const desktopResult = await uploadToCloudinary(
            desktop.buffer,
            `${title.trim()}-desktop`
        );

        await ProductCategoryModel({
            name: name.trim(),
            slug:slug.trim(),
            shortdes: shortdes.trim(),
            desktopImage: desktopResult.secure_url,
            mobileImage: mobileResult.secure_url,
            status:status
        });

        return res.status(200).json({ success: true, message: "Product category successfully" });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

export const updateProductCategory = async (req, res) => {
    try {

        const {id} = req.params;

        const { name, shortdes, slug, status} = req.body;

        const mobile = req.files?.mobileImg?.[0];
        const desktop = req.files?.desktopImg?.[0];

        const categoryDetails = await ProductCategoryModel.findById(id);

        if(!categoryDetails){
            return res.status(404).json({
                success:false, 
                message:"Product Category is not found"
            })
        }

        let desktopResult = null;
        let mobileResult = null;

        if(mobile){
            const oldMobileImage = categoryDetails.mobileImage;

            mobileResult = await uploadToCloudinary(
                mobile.buffer,
                `${categoryDetails.name}-mobile`
            );

            categoryDetails.mobileImage = mobileResult.secure_url;

            if (oldMobileImage) {
                try {
                    await deleteFromCloudinary(oldMobileImage);
                } catch (error) {
                    console.log(
                        "Old mobile image delete failed:",
                        error.message
                    );
                }
            }
        }

        if(desktop){
            const oldDesktopImage = categoryDetails.desktopImage;

            desktopResult = await uploadToCloudinary(
                desktop.buffer,
                `${categoryDetails.name}-desktop`
            );

            categoryDetails.mobileImage = desktopResult.secure_url;

            if (oldDesktopImage) {
                try {
                    await deleteFromCloudinary(oldDesktopImage);
                } catch (error) {
                    console.log(
                        "Old desktop image delete failed:",
                        error.message
                    );
                }
            }
        }


        if(name.trim()){
            categoryDetails.name = name.trim();
        }

        if(slug.trim()){
            categoryDetails.slug = slug.trim();
        }

        if(shortdes.trim()){
            categoryDetails.shortdes = shortdes.trim();
        }

        if(status.trim()){
            categoryDetails.status = status.trim()
        }

        await categoryDetails.save();

        return res.status(200).json({success:true, message: "Product Category Update Successfully"});
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

export const updateProductCategoryStatus = async (req, res) => {
    try{
        const {id} = req.params;

        if(!id.trim()){
            return res.status(400).json({success:false,message: "CategoryId are required"});
        }

        const categoryDetails = await ProductCategoryModel.findById(id);

        if(!categoryDetails){
            return res.status(404).json({success:false, message:"Category not  found"});
        }

        categoryDetails.status = !categoryDetails.status;

        return res.status(200).json({success:true, message: "Status update successfully"});

    }
    catch(err){
        return res.status(500).json({success:false, message: err.message});
    }
}

export const deleteProductCategory = async(req, res) => {
    try{
        const {id} = req.params;

       const products = await ProductModel.findOne({categoryId:id.trim()});

       if(products){
        return res.status(400).json({success:false, message:"This category belong to someone products."});
       }

       const categoryDetails = await ProductCategoryModel.findById(id);

       if(!categoryDetails){
        return res.status(404).json({success:false, message:"Category is not found"});
       }

       await deleteFromCloudinary(categoryDetails?.desktopImage);
       await deleteFromCloudinary(categoryDetails?.mobileImage);

       return res.status(200).json({success:true, message: "Category Delete Successfully"});
    }
    catch(err){
        return res.status(500).json({success:false, message: err.message})
    }
}

export const getProductCategory = async(req, res) => {
    try{
        const category = await ProductCategoryModel.find({status:true});

        if(category.length){
            return res.status(404).json({success:false, message: "Product Category not found"});
        }

        return res.status(200).json({success:true, category: category})
    }
    catch(err){
        return res.status(500).json({success:false, message: err.message})
    }
}

export const getProductCategoryAdmin = async (req, res) => {
    try{
        const category = await ProductCategoryModel.find();

        if(category.length){
            return res.status(404).json({success:false, message: "Product Category not found"});
        }

        return res.status(200).json({success:true, category:category})
    }
    catch(err){
        return req.status(500).json({success:false, message: err.message})
    }
}