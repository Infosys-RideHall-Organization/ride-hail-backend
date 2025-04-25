// models/User.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
});

const User = mongoose.model("User", userSchema);
export default User;
