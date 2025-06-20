import {Request} from "express";

export interface SignUpBody{
name:string,
email:string,
password:string
}

export interface VerifyEmailBody {
    verificationToken:string
}

export interface SignInBody{
    email:string,
    password:string
}

export interface ForgotPasswordBody{
    email:string,
}

export interface VerifyResetTokenBody {
    resetPasswordToken:string
}

export interface ResetPasswordBody {
    resetPasswordToken:string,
    password:string
}

export interface ChangePasswordBody {
    password:string
}

export interface AuthRequest extends Request {
    userId?: number;
    token?:string
}
