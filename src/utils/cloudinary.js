import cloudinary from "../config/cloudinary.js";

// Cloudinary rejects characters like ? & # % < > \ in folder/public_id,
// so turn titles like "Which Mixer Should You Try?" into "which-mixer-should-you-try"
const sanitizeFolderName = (name) => {
    return String(name || "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 100) || "uploads";
};

export const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder: sanitizeFolderName(folder),
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            )
            .end(buffer);
    });
};

export const deleteFromCloudinary = async (imageUrl) => {
    try {
        if (!imageUrl) return;

        const url = new URL(imageUrl);
        const pathname = url.pathname;

        const uploadIndex = pathname.indexOf("/upload/");
        if (uploadIndex === -1) return;

        let publicPath = pathname.substring(uploadIndex + 8);
        const parts = publicPath.split("/");

        if (parts[0]?.startsWith("v")) {
            parts.shift();
        }

        const fileName = parts.pop();
        const fileNameWithoutExtension = fileName.substring(
            0,
            fileName.lastIndexOf(".")
        );

        parts.push(fileNameWithoutExtension);

        const publicId = parts.join("/");

        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary delete error:", error.message);
    }
};