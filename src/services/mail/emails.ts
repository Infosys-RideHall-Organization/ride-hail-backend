import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import {
    VERIFICATION_EMAIL_TEMPLATE,
    RESET_PASSWORD_REQUEST_EMAIL_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_SUCCESS_TEMPLATE
} from "./email.templates";


//set up nodemailer transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth:{
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
});

export const sendVerificationEmail = async (email:string, verificationToken:string) => {
    try {
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken)
        };

        let info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent: ", info.response);
    } catch (error) {
        console.error("Error sending verification email", error);
    }
};

export const sendWelcomeEmail = async (email:string, name:string) => {
    try {
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Welcome to RideHail App!",
            html: VERIFICATION_EMAIL_SUCCESS_TEMPLATE.replace("{{user_name}}", name)
        };

        let info = await transporter.sendMail(mailOptions);
        console.log("Welcome email sent: ", info.response);
    } catch (error) {
        console.error("Error sending welcome email", error);
    }
};

export const sendPasswordResetEmail = async (email:string, resetPasswordToken:string) => {
    try {
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Reset your password",
            html: RESET_PASSWORD_REQUEST_EMAIL_TEMPLATE.replace("{resetPasswordToken}", resetPasswordToken)
        };

        let info = await transporter.sendMail(mailOptions);
        console.log("Password reset email sent: ", info.response);
    } catch (error) {
        console.error("Error sending password reset email", error);
    }
};

export const sendResetSuccessEmail = async (email:string) => {
    try {
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE
        };

        let info = await transporter.sendMail(mailOptions);
        console.log("Password reset success email sent: ", info.response);
    } catch (error) {
        console.error("Error sending password reset success email", error);
    }
};
