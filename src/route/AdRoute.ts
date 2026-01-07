import { Router } from "express";
import { createNewAd, deleteAd, getAdAllDetails, getAllAds, getUserAds, updateAd } from "../controller/AdsController";
import { upload } from "../middleware/upload";
import { authenticate } from "../middleware/auth";
import { requiredRole } from "../middleware/role";
import { Roles } from "../model/User";

const router = Router();

// FIX: Attach Multer middleware to parse form-data
router.post("/newAd", upload.array("images", 5), createNewAd);
router.get("/getUserAd", getUserAds);
router.get("/getAll", getAllAds);
router.get("/getAdAllDetails/:id", getAdAllDetails);
router.post("/delete/:id", authenticate , requiredRole([Roles.ADMIN, Roles.FARMER]) ,deleteAd);
router.post("/update/:id", authenticate , requiredRole([Roles.ADMIN, Roles.FARMER]) ,updateAd);

export default router;