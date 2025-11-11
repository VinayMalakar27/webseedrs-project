import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMe, getAllUsers, updateProfile } from "../controllers/userController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.get("/", protect, getAllUsers);
router.put("/profile", protect, upload.single("avatar"), updateProfile);

export default router;
