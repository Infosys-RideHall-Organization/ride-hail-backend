import {Errback,NextFunction,Request,Response} from 'express';

export const errorHandler = (error:Errback,req:Request,res:Response,next:NextFunction) => {
    console.log(error);
    res.status(500).json({
        success: false,
        error: "Something went wrong. Please try again.",
    });
}