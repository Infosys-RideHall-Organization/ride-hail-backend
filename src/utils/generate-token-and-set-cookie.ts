import {Response} from "express";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();

export const generateTokenAndSetCookie =  (res: Response, userId: string) => {
    //Generate token
    const token = jwt.sign(
        {userId},
        String(process.env.JWT_SECRET),
        {expiresIn: '7d'}
    );

    //Set Cookie
    res.cookie(
        'token',
        token,
        {
            httpOnly: true,
            secure: false,
            sameSite: "lax" ,// Allows sending cookies in cross-origin requests
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

    return token;
}