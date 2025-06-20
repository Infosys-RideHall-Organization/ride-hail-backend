// models/Vehicle.ts

import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["Buggy", "Transport Truck", "Bot"],
        required: true,
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    identifier: {
        type: String,
        unique: true,
        required: true,
    },
    capacity: {
        passengers: {
            type: Number,
            min: 1,
            max: 3,
            default: 3,
        },
        weight: {
            type: Number,
            min: 1,
            max: 3,
            default: 3,
        },
    },
    currentLocation: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        required:false
    },
    isBooked: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
