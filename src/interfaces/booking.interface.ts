import { Types } from "mongoose";

export interface ILatLng {
    lat: number;
    lng: number;
}


export interface IPassenger {
    name: string;
    phoneNo: string;
    email: string;
    companyName: string;
}

export interface IWeight{
    name: string;
    weight: number;
}

export interface IBooking extends Document {
    userId: Types.ObjectId;
    vehicleId: Types.ObjectId;
    campus: Types.ObjectId;
    origin: ILatLng;
    originAddress: string;
    destination: ILatLng;
    destinationAddress: string;
    vehicleType: "Buggy" | "Transport Truck" | "Bot";
    schedule: Date;
    status: "unverified" | "verified" | "completed" | "cancelled" | "emergency";
    passengers?: IPassenger[];
    weightItems?:IWeight[];
    otp:string,
    otpVerified: boolean;
    itemDetails?: {
        weight: string;
        itemName: string;
    };
    createdAt: Date;
    updatedAt: Date;
    emergencyReason?: string;
}