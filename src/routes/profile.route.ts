import express from "express";
import multer from "multer";
import {
    deleteProfile,
    getProfile,
    getProfileImage,
    updateProfile,
    uploadProfileImage,
    updatePlayerId
} from "../controllers/profile.controller";
import {verifyToken} from "../middlewares/verify-token";

const profileRouter = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

profileRouter.get('/:id',verifyToken,getProfile);
profileRouter.delete('/:id',verifyToken,deleteProfile);
profileRouter.put("/:id",upload.single("image"),verifyToken,updateProfile);
profileRouter.post('/:id/image', verifyToken,upload.single('image'), uploadProfileImage);
profileRouter.get('/:id/image',getProfileImage);
profileRouter.put('/update-player-id/:userId',updatePlayerId);


export default profileRouter;

