import { Request, Response } from 'express';
import User from "../db/schema/user.schema";
import path from "node:path";
import * as fs from "node:fs";


// GET /api/profile/:id
export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'});
            return;
        }

        const imageUrl = user.profileImage?.data
            ? `/profile/${user._id}/image`
            : `/assets/default-profile.png`;

        res.json({
            success: true,
            message: "User profile found!",
            _id:user._id,
            name: user.name,
            email: user.email,
            gender: user.gender,
            imageUrl: imageUrl,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile' });
    }
};

// PUT /api/profile/:id
export const updateProfile = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const { name, gender } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
             res
                .status(404)
                .json({
                    success: false,
                    error: "User not found"
                });
             return;
        }

        // Update profile image if sent
        if (req.file) {
            user.profileImage = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            };
        }

        // Update name and gender if provided
        if (name){
            user.name = name;
        }

        if (gender){
            user.gender = gender;
        }

        await user.save();

        res.json({
            success: true,
            message: "Profile updated",
            _id:user._id,
            name: user.name,
            email: user.email,
            gender: user.gender,
            imageUrl: user.profileImage?.data
                ? `/profile/${user._id}/image`
                : `/assets/default-profile.png`,
        });
    } catch (err) {
        console.error("Profile update error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to update profile"
        });
    }
};
// POST /api/profile/:id/image
export const uploadProfileImage = async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({
            success: false,
            error: 'No image provided' });
        return;
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                profileImage: {
                    data: req.file.buffer,
                    contentType: req.file.mimetype,
                },
            },
            { new: true }
        );

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found' });
        }

        res.json({ message: 'Image uploaded successfully' });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Failed to upload image' });
    }
};

// GET /api/profile/:id/image
export const getProfileImage = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user?.profileImage?.data) {
            // Serve default image
            const defaultImagePath = path.join(__dirname, '../../public/assets/default-profile.png');
            if (fs.existsSync(defaultImagePath)) {
                console.log('here')
                res.contentType('image/png');
                fs.createReadStream(defaultImagePath).pipe(res);
            } else {
                res.status(404).send('Default image not found');
            }
            return;
        }

        res.contentType(String(user.profileImage.contentType));
        res.send(user.profileImage.data);
    } catch (err) {
        console.error("Error loading profile image:", err);
        res.status(500).send('Failed to load image');
    }
};

// DELETE /api/profile/:id
export const deleteProfile = async (req: Request, res: Response) => {
    const userId = req.params.id;

    try {
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            res.status(404).json({
                success: false,
                error: "User not found"
            });
            return;
        }
        const imageUrl = user.profileImage?.data
            ? `/profile/${user._id}/image`
            : `/assets/default-profile.png`;

        res.json({
            success: true,
            message: "User deleted successfully",
            _id:user._id,
            name: user.name,
            email: user.email,
            gender: user.gender,
            imageUrl: imageUrl,
        });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({
            success: false,
            error: "Failed to delete user"
        });
    }
};

export const updatePlayerId = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { playerId } = req.body;

        if (!playerId) {
            res.status(400).json({ success: false, error: "playerId is required" });
            return;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { playerId },
            { new: true }
        );

        if (!user) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }

        res.status(200).json({ success: true, message: "Player ID updated",
            ...user.toObject(),
            password: undefined
        });
    } catch (error) {
        console.error("Error updating playerId:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

