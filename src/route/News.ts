import { Router } from "express";
import { getTopNews } from "../controller/DeshayaNews";

const router = Router()

router.get("/get", getTopNews)

export default router;