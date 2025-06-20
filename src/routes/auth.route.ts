import express from "express";
import {
    signUp,
    signIn,
    verifyEmail,
    signOut,
    forgotPassword,
    verifyResetToken,
    resetPassword, checkAuth, resetPasswordWithId, googleSignIn,
} from "../controllers/auth.controller";
import {verifyToken} from "../middlewares/verify-token";

const authRouter = express.Router();

authRouter.post('/signup',signUp);
authRouter.post('/verify-email',verifyEmail);
authRouter.post('/signin',signIn);
authRouter.post('/google-sign-in',googleSignIn);
authRouter.post('/sign-out',signOut);
authRouter.post('/forgot-password',forgotPassword);
authRouter.post('/verify-reset-token',verifyResetToken);
authRouter.post('/reset-password',resetPassword);
authRouter.post('/reset-password/:id',resetPasswordWithId);
authRouter.get('/check-auth',verifyToken,checkAuth);


export default authRouter;

