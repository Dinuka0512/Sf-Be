import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Ad from "../model/Ad";
import { User } from "../model/User";
import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";
import { AuthRequest } from "../middleware/auth";

export const createNewAd = async (req: Request, res: Response) => {
  try {
    const { title, description, price, category } = req.body;

    // 🔐 Auth
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization token missing" });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.sub;

    // ✅ Validation
    if (!title || !description || !price || !category) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "At least one image required" });
    }

    // 📸 Upload Images directly to Cloudinary
    const imageUrls = await uploadAdImages(files);

    // 💾 Save Ad
    const newAd = new Ad({
      title,
      description,
      price: parsedPrice,
      category,
      images: imageUrls,
      farmer: userId,
    });

    await newAd.save();

    return res.status(201).json({
      message: "Ad created successfully",
      ad: newAd,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Upload images to Cloudinary using buffer (no local storage)
 */
const uploadAdImages = async (
  files: Express.Multer.File[]
): Promise<string[]> => {
  const urls: string[] = [];

  for (const file of files) {
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "ads" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });

    urls.push(result.secure_url);
  }

  return urls;
};


export const getUserAds = async (req: Request, res: Response) => {
  try{
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization token missing" });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.sub;

    const {contentPerPage, currentPage} = req.query;
    if (contentPerPage&& currentPage) { 
      const page = parseInt(currentPage as string, 10) || 1; 
      const limit = parseInt(contentPerPage as string, 10) || 10; 
      const skip = (page - 1) * limit;
      
      // get paginated ads 
      const userAdsWithPaginations = await Ad.find({ farmer: userId }) .skip(skip) .limit(limit); 
      
      // get total count for pagination metadata 
      const totalCount = await Ad.countDocuments({ farmer: userId }); 
      return res.json({ 
        data: userAdsWithPaginations, 
        pagination: { 
          currentPage: page, 
          contentPerPage: limit, 
          totalItems: totalCount, 
          totalPages: Math.ceil(totalCount / limit), 
        }, 
      }); 
    }

    const userAds = await Ad.find({farmer:userId})
    return res.json(userAds) 
  }catch(err){
    console.error(err);
    return res.status(500).json({ message: "Server error"});
  }
}

export const getAllAds = async (req: Request, res: Response) => {
  try {
    // Get page and limit from query params, with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;

    // Calculate how many docs to skip
    const skip = (page - 1) * limit;

    // Get total count for frontend pagination info
    const total = await Ad.countDocuments();

    // Get ads with limit and skip
    const ads = await Ad.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // optional: newest first

    // Return paginated data
    return res.status(200).json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalAds: total,
      ads,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error", "error":err.message });
  }
};


export const getAdAllDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Ad ID is required" });
    }

    // Fetch ad AND populate farmer (User), exclude password
    const ad = await Ad.findById(id).populate({
      path: "farmer",
      select: "-password", // remove password
    });

    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    res.status(200).json(ad);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const deleteAd = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Ad ID is required" });
    }

    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    await Ad.findByIdAndDelete(id);

    res.status(200).json({ message: "Ad deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateAd = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, category, price } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Ad ID is required" });
    }

    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    // ✅ Update only sent fields
    if (title) ad.title = title;
    if (description) ad.description = description;
    if (category) ad.category = category;
    if (price) ad.price = price;

    await ad.save();

    res.status(200).json({
      message: "Ad updated successfully",
      ad,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
