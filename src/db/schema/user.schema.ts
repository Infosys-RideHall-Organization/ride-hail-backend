// models/User.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    profileImage: {
        data: Buffer,
        contentType: String,
    },
    name: {
        type: String,
        required: true,
        maxlength: 255,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: 255,
    },
    gender:{
        type: String,
        required: false,
        enum: ["Male", "Female","Other","Not Specified"],
        default: "Not Specified",
    },
    password: {
        type: String,
        required: true,
        maxlength: 255,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: {
        type: String,
        maxlength: 4,
    },
    resetPasswordExpiresAt: {
        type: Date,
    },
    isResetVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        maxlength: 4,
    },
    verificationTokenExpiresAt: {
        type: Date,
    },
    role: {
        type: String,
        enum: ["user", "driver"],
        default: "user",
    },
    playerId: { type: String },

}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
});

const User = mongoose.model("User", userSchema);
export default User;
