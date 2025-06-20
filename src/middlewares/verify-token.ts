import {NextFunction, Response} from 'express';
import {AuthRequest} from "../interfaces/auth.interface";
import jwt from "jsonwebtoken";

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['x-auth-token'] as string | undefined;

        if (!token) {
             res.status(401).json({
                success: false,
                error: "No token provided",
            });
             return;
        }

        const isVerified = jwt.verify(token, String(process.env.JWT_SECRET)) as { userId: number };

        req.userId = isVerified.userId;
        next();

    } catch (error: any) {
        console.error(error);

        // If token expired
        if (error.name === 'TokenExpiredError') {
             res.status(401).json({
                success: false,
                error: "Token expired",
            });
             return;
        }

        // Other JWT errors
        if (error.name === 'JsonWebTokenError') {
             res.status(401).json({
                success: false,
                error: "Invalid token",
            });
             return;
        }

        // Generic fallback
        res.status(500).json({
            success: false,
            error: "Something went wrong. Please try again.",
        });
    }
}
