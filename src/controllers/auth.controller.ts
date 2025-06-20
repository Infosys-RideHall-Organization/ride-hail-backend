import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { isEmail, isStrongPassword } from 'validator';
import {OAuth2Client, TokenPayload} from 'google-auth-library';
import {
    AuthRequest, ChangePasswordBody,
    ForgotPasswordBody,
    ResetPasswordBody,
    SignInBody,
    SignUpBody,
    VerifyEmailBody,
    VerifyResetTokenBody,
} from "../interfaces/auth.interface";

import User from "../db/schema/user.schema";
import { generateFourDigitOtp } from "../utils/generate-four-digit-otp";
import { generateTokenAndSetCookie } from "../utils/generate-token-and-set-cookie";
import {
    sendPasswordResetEmail,
    sendResetSuccessEmail,
    sendVerificationEmail,
    sendWelcomeEmail,
} from "../services/mail/emails";

dotenv.config();


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleSignIn = async (req: Request, res: Response): Promise<void> => {
    const { idToken } = req.body as { idToken: string };

    if (!idToken) {
        res.status(400).json({ success: false, message: "ID token is required" });
        return;
    }

    console.log(idToken);

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID!,
        });
        const payload = ticket.getPayload();


        if (!payload || !payload.email || !payload.name) {
            res.status(400).json({success: false, message: "Invalid Google payload"});
            return;
        }

        const {email, name,picture} = payload as TokenPayload;

        let user = await User.findOne({email});

        if (!user) {
            user = new User({
                name,
                email,
                profileImage:picture,
                password: "GOOGLE_AUTH", // or undefined if you update schema
                isVerified: true,
            });
            await sendWelcomeEmail(user.email, user.name);
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateTokenAndSetCookie(res, user._id.toString());

        res.status(200).header("x-auth-token", token).json({
            success: true,
            message: "Signed in Successfully!",
            ...user.toObject(),
            password: undefined,
        });
    }catch(err) {
    }
}

export const signUp = async (req: Request<{}, {}, SignUpBody>, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            res.status(400).json({ success: false, error: 'All the fields are required' });
            return;
        }

        if (!isEmail(email)) {
            res.status(400).json({ success: false, error: "Please enter a valid email" });
            return;
        }

        if (!isStrongPassword(password, {
            minLength: 8,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })) {
             res.status(400).json({
                success: false,
                error: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
            });
             return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
             res.status(400).json({
                 success: false,
                 error: "Something went wrong. Please try again."
             });
             return;
        }

        const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_FACTOR));
        const verificationToken = generateFourDigitOtp();
        const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiresAt,
        });

        await sendVerificationEmail(newUser.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "Signed Up Successfully!",
            ...newUser.toObject(),
            password: undefined,
        });
    } catch (error) {
        console.error("Sign up error:", error);
        res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
    }
};

export const verifyEmail = async (req: Request<{}, {}, VerifyEmailBody>, res: Response) => {
    try {
        const { verificationToken } = req.body;

        if (!verificationToken) {
            res.status(400).json({ success: false, error: 'Verification Token is required' });
            return;
        }

        const user = await User.findOne({
            verificationToken,
            verificationTokenExpiresAt: { $gt: new Date() },
        });

        if (!user) {
             res.status(400).json({ success: false, error: "Invalid or expired verification OTP." });
             return;
        }

        user.verificationToken = null;
        user.verificationTokenExpiresAt = null;
        user.isVerified = true;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: "Email Verified Successfully!",
            ...user.toObject(),
            password: undefined,
        });
    } catch (error) {
        console.error("Verify email error:", error);
        res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
    }
};

export const signIn = async (req: Request<{}, {}, SignInBody>, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password || !isEmail(email)) {
             res.status(400).json({ success: false, error: "Invalid Credentials!" });
             return;
        }

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(400).json({ success: false, error: "Invalid Credentials!" });
            return;
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateTokenAndSetCookie(res, user._id.toString());

        res.status(200).header("x-auth-token", token).json({
            success: true,
            message: "Signed in Successfully!",
            ...user.toObject(),
            password: undefined,
        });
    } catch (error) {
        console.error("Sign in error:", error);
        res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
    }
};

export const forgotPassword = async (req: Request<{}, {}, ForgotPasswordBody>, res: Response) => {
    try {
        const { email } = req.body;

        if (!email || !isEmail(email)) {
             res.status(400).json({ success: false, error: "Enter a valid email address" });
             return;
        }

        const user = await User.findOne({ email });
        if (!user) {
             res.status(400).json({ success: false, error: "Invalid Credentials!" });
             return;
        }

        user.resetPasswordToken = generateFourDigitOtp();
        user.resetPasswordExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        await sendPasswordResetEmail(user.email, user.resetPasswordToken);

        res.status(200).json({ success: true, message: "Password reset OTP is sent to your email!" });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
    }
};

export const verifyResetToken = async (req: Request<{}, {}, VerifyResetTokenBody>, res: Response) => {
    try {
        const { resetPasswordToken } = req.body;

        if (!resetPasswordToken) {
             res.status(400).json({ success: false, error: "Token is required" });
             return;
        }

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpiresAt: { $gt: new Date() },
        });

        if (!user) {
            res.status(400).json({ success: false, error: "Invalid or expired OTP" });
            return;
        }

        user.isResetVerified = true;
        await user.save();

        res.status(200).json({ success: true, message: "Reset OTP verification successful!" });
    } catch (error) {
        console.error("Verify reset token error:", error);
        res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
    }
};

export const resetPassword = async (req: Request<{}, {}, ResetPasswordBody>, res: Response) => {
    try {
        const { password, resetPasswordToken } = req.body;

        if (!password || !resetPasswordToken) {
             res.status(400).json({ success: false, error: "Invalid Credentials!" });
             return;
        }

        if (!isStrongPassword(password, {
            minLength: 8,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })) {
             res.status(400).json({
                success: false,
                 error: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
             });
             return;
        }

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpiresAt: { $gt: new Date() },
            isResetVerified: true,
        });

        if (!user) {
            res.status(400).json({ success: false, error: "Invalid or expired reset token!" });
            return;
        }

        user.password = await bcrypt.hash(password, Number(process.env.SALT_FACTOR));
        user.resetPasswordToken = null;
        user.resetPasswordExpiresAt = null;
        user.isResetVerified = false;
        await user.save();

        await sendResetSuccessEmail(user.email);

        res.status(200).json({ success: true, message: "Password reset successful!" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
    }
};

export const resetPasswordWithId = async (req: Request<{id:string}, {}, ChangePasswordBody>, res: Response) => {
    try {
        const userId = req.params.id;
        const { password } = req.body;

        if (!password || !userId) {
            res.status(400).json({ success: false, error: "Invalid Credentials!" });
            return;
        }

        if (!isStrongPassword(password, {
            minLength: 8,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })) {
            res.status(400).json({
                success: false,
                error: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
            });
            return;
        }

        const user = await User.findById(userId);

        if (!user) {
            res.status(400).json({ success: false, error: "Something went wrong, try again." });
            return;
        }

        user.password = await bcrypt.hash(password, Number(process.env.SALT_FACTOR));
        await user.save();
        res.status(200).json({ success: true, message: "Password reset successful!"});
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
    }
};

export const checkAuth = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
             res.status(404).json({ success: false, error: "Invalid or Expired token" });
             return;
        }

        res.status(200).json({
            success: true,
            message: "Authentication successful!",
            ...user.toObject(),
            password: undefined,
        });
    } catch (error) {
        console.error("Check auth error:", error);
        res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
    }
};

export const signOut = async (_req: Request, res: Response) => {
    try {
        res.clearCookie("token");
        res.removeHeader('x-auth-token');
        res.status(200).json({ success: true, message: "Signed out successfully!" });
    } catch (error) {
        console.error("Sign out error:", error);
        res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
    }
};


