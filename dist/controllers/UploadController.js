"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uploadClodinary_1 = require("../utils/uploadClodinary");
class UploadController {
    constructor() {
        this.upload = async (req, res) => {
            try {
                const file = req.file;
                if (!file) {
                    res.status(400).json({ message: "No file uploaded" });
                    return;
                }
                const folder = req.query.folder || "uploads";
                const result = await (0, uploadClodinary_1.uploadCloudinary)(file.buffer, folder, file.originalname);
                res.status(201).json({ url: result.secure_url });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        };
    }
}
exports.default = new UploadController();
