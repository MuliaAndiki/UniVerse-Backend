import { Request, Response } from "express";
import { uploadCloudinary } from "../utils/uploadClodinary";

class UploadController {
  public upload = async (req: Request, res: Response): Promise<void> => {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) { res.status(400).json({ message: "No file uploaded" }); return; }
      const folder = (req.query.folder as string) || "uploads";
      const result = await uploadCloudinary(file.buffer, folder, file.originalname);
      res.status(201).json({ url: result.secure_url });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };
}

export default new UploadController();
