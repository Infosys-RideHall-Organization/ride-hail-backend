// models/Booking.ts

import mongoose, { Schema } from "mongoose";
import { IBooking } from "../../interfaces/booking.interface";
import { LatLngSchema } from "./latlng.schema";

const bookingSchema = new Schema<IBooking>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        campus: {
            type: Schema.Types.ObjectId,
            ref: "Campus",
            required: true,
        },
        origin: {
            type: LatLngSchema,
            required: true,
        },
        originAddress: {
            type: String,
            required: true,
        },
        destination: {
            type: LatLngSchema,
            required: true,
        },
        destinationAddress: {
            type: String,
            required: true,
        },
        vehicleType: {
            type: String,
            enum: ["Buggy", "Transport Truck", "Bot"],
            required: true,
        },
        vehicleId: {
            type: Schema.Types.ObjectId,
            ref: "Vehicle",
            required: false,
            default: null,
        },
        schedule: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["unverified", "verified", "completed", "cancelled","emergency"],
            default: "unverified",
        },
        otp: {
            type: String,
        },
        otpVerified: {
            type: Boolean,
            default: false,
        },
        passengers: [
            {
                name: { type: String, required: true },
                phoneNo: { type: String, required: true },
                email: { type: String, required: true },
                companyName: { type: String, required: true },
            },
        ],
        weightItems: [
            {
                itemName: { type: String, required: true },
                weight: { type: Number, required: true }, // float
            },
        ],
        itemDetails: {
            weight: { type: String },
            itemName: { type: String },
        },
        emergencyReason:{
            type: String,
            default: null
        }
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
