const express = require('express');
const router = express.Router();
const cloudinary = require("../images/cloudinary");
const upload = require("../config/multer");
const Scope = require("../models/scopeSchema")

router.post('/upload', upload.single('image'), function (req, res) {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded",
        });
    }
    cloudinary.uploader.upload(req.file.path, function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error uploading file",
            });
        }
        // fs.unlinkSync(req.file.path);
        const imageUrl = result.secure_url;
        const { scopeName, description, latitude, longitude} = req.body
        const newScope = new Scope({
            scopeName,
            description,
            latitude,
            longitude,
            imageUrl: result.secure_url, 
        });
        res.status(200).json({
            success: true,
            message: "Uploaded successfully",
            data: result,
            imageUrl: imageUrl,
        });
    });
});

module.exports = router;
