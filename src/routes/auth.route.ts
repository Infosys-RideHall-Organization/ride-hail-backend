import express from "express";
import {
    signUp,
    signIn,
    verifyEmail,
    signOut,
    forgotPassword,
    verifyResetToken,
    resetPassword, checkAuth
} from "../controllers/auth.controller";
import {verifyToken} from "../middlewares/verify-token";

const authRouter = express.Router();

authRouter.post('/signup',signUp);
authRouter.post('/verify-email',verifyEmail);
authRouter.post('/signin',signIn);
authRouter.post('/sign-out',signOut);
authRouter.post('/forgot-password',forgotPassword);
authRouter.post('/verify-reset-token',verifyResetToken);
authRouter.post('/reset-password',resetPassword);
authRouter.get('/check-auth',verifyToken,checkAuth);


export default authRouter;

