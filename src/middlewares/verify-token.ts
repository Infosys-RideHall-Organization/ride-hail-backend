import {NextFunction, Response} from 'express';
import {AuthRequest} from "../interfaces/auth.interface";
import jwt from "jsonwebtoken";

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Get token from cookies or headers
        //const token = req.cookies.token;
        const token = req.headers['x-auth-token'] as string|undefined;

        // Validate token
        if (!token) {
            res.status(401).json({
                success: false,
                error: "No token provided",
            });
            return;
        }

        // Verify the token
        const isVerified =jwt.verify(token, String(process.env.JWT_SECRET));

        // Not verified
        if(!isVerified) {
            res.status(401).json({
            success: false,
            error: "Token verification failed",
            });
            return;
        }

        // Get user id from the valid token
        const verifiedToken = isVerified as {userId:number};

        // Set user Id
        req.userId = verifiedToken.userId;

        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: "Something went wrong. Please try again.",
        });
    }
}