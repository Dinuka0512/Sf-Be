import { Router } from "express";
import { changePassword, checkOtp, fogetPassword, login, register, getUserRole, getMyDetails, updateUser } from "../controller/UserController";
import { authenticate } from "../middleware/auth";

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/otpGenarate",fogetPassword)
router.post("/checkOtp", checkOtp)
router.post("/changePassword", changePassword)
router.get("/getRole", getUserRole)
router.get("/me",authenticate,getMyDetails)
router.post("/update",authenticate, updateUser)

export default router