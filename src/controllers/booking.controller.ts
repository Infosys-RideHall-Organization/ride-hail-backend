import { Request, Response } from "express";
import Booking from "../db/schema/booking.schema";
import Vehicle from "../db/schema/vehicle.schema";
import mongoose from "mongoose";
import {generateFourDigitOtp} from "../utils/generate-four-digit-otp";
import {sendBookingNotificationToDrivers,sendScheduledNotificationToDriver} from "./notifications.controller";

// Create a new booking
export const createBooking = async (req: Request, res: Response) => {
    try {
        const {
            origin,
            originAddress,
            destination,
            destinationAddress,
            schedule,
            vehicleType,
            passengers,
            weightItems,
            itemDetails,
            userId,
            campus,
        } = req.body;

        if (
            !origin ||
            !originAddress ||
            !destination ||
            !destinationAddress ||
            !schedule ||
            !vehicleType ||
            !userId ||
            !campus
        ) {
            res.status(400).json({ success: false, error: "Missing required fields" });
            return;
        }

        // Create otp
        const otp = generateFourDigitOtp();

        // Create booking without vehicle assignment
        const booking = await Booking.create({
            userId,
            campus,
            origin,
            originAddress,
            destination,
            destinationAddress,
            vehicleType,
            schedule,
            passengers,
            weightItems,
            itemDetails,
            otp,
        });

        const populatedBooking = await booking.populate("campus");

        const scheduledTime = new Date(schedule);
        const now = new Date();
        const diffMs = scheduledTime.getTime() - now.getTime();
        const diffMinutes = diffMs / (1000 * 60);

        if (diffMinutes > 2) {

            await sendScheduledNotificationToDriver(
                populatedBooking.id.toString(),
                userId,
                scheduledTime.toISOString()
            );
        } else {
            await sendBookingNotificationToDrivers(populatedBooking.id.toString());
        }

        res.status(201).json({
            success: true,
            message: "Booking created. Waiting for vehicle assignment.",
            booking: populatedBooking,
        });
        return;
    } catch (error) {
        console.error("Error creating booking:", error);
         res.status(500).json({ success: false, error: "Internal server error" });
         return;
    }
};

// Assign a free vehicle to booking
export const assignVehicleToBooking = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId).populate("campus");
        if (!booking) {
             res.status(404).json({ success: false, error: "Booking not found" });
             return;
        }

        if (booking.vehicleId) {
             res.status(400).json({ success: false, error: "Vehicle already assigned" });
             return;
        }

        let availableVehicle;

        if (booking.vehicleType === "Buggy") {
            availableVehicle = await Vehicle.findOne({
                type: "Buggy",
                isBooked: false,
                "capacity.passengers": { $gte: booking?.passengers?.length },
            });
        } else if (["Transport Truck", "Bot"].includes(booking.vehicleType)) {
            availableVehicle = await Vehicle.findOne({
                type: booking.vehicleType,
                isBooked: false,
            });
        }

        if (!availableVehicle) {
             res.status(400).json({ success: false, error: "No available vehicle" });
             return;
        }

        booking.vehicleId = availableVehicle._id;
        await booking.save();

        availableVehicle.isBooked = true;
        await availableVehicle.save();

        res.status(200).json({ success: true, message: "Vehicle assigned", booking });
    } catch (error) {
        console.error("Error assigning vehicle:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// Verify booking OTP
export const verifyBookingOtp = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const { otp } = req.body;

        if (!otp) {
            res.status(400).json({ success: false, error: "OTP is required" });
            return;
        }

        const booking = await Booking.findById(bookingId).populate('campus');

        if (!booking) {
            res.status(404).json({ success: false, error: "Booking not found" });
            return;
        }

        if (booking.otp === otp) {
            booking.status = "verified";
            booking.otpVerified = true;
            await booking.save();

            res.status(200).json({ success: true, message: "OTP verified successfully.",booking});
        } else {
            res.status(400).json({ success: false, error: "Invalid OTP." });
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// Get all bookings by userId
export const getBookingsByUserId = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Fetch bookings where the userId matches
        const bookings = await Booking.find({ userId }).populate('campus');


        res.status(200).json({
            success: true,
            message: "Bookings fetched successfully.",
            bookings,
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error." });
    }
};

// Get a booking by its ID
export const getBookingById = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;

        if (!bookingId) {
            res.status(400).json({ success: false, error: "Booking ID is required" });
            return;
        }

        const booking = await Booking.findById(bookingId).populate('campus');

        if (!booking) {
            res.status(404).json({ success: false, error: "Booking not found" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Booking fetched successfully.",
            booking,
        });
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// Update booking status
export const updateBookingStatus = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        if (!status) {
            res.status(400).json({ success: false, error: "Status is required" });
            return;
        }

        const booking = await Booking.findById(bookingId).populate('campus');

        if (!booking) {
            res.status(404).json({ success: false, error: "Booking not found" });
            return;
        }

        booking.status = status;
        await booking.save();

        res.status(200).json({
            success: true,
            message: `Booking status updated to ${status}`,
            booking,
        });
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// Cancel Booking
export const cancelBooking = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId).populate('campus');

        if (!booking) {
            res.status(404).json({ success: false, error: "Booking not found" });
            return;
        }

        if (booking.status === "cancelled") {
            res.status(400).json({ success: false, error: "Booking is already cancelled" });
            return;
        }

        booking.status = "cancelled";
        await booking.save();

        // Free the vehicle if already assigned
        if (booking.vehicleId) {
            const vehicle = await Vehicle.findById(booking.vehicleId);
            if (vehicle) {
                vehicle.isBooked = false;
                await vehicle.save();
            }
        }

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully.",
            booking,
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// Emergency stop a booking
export const emergencyStopBooking = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body;

        const booking = await Booking.findById(bookingId).populate('campus');

        if (!booking) {
            res.status(404).json({ success: false, error: "Booking not found" });
            return;
        }

        if (booking.status === "emergency") {
            res.status(400).json({ success: false, error: "Booking already emergency stopped" });
            return;
        }

        // Update booking status
        booking.status = "emergency";

        // Optionally log reason
        if (reason) {
            booking.emergencyReason = reason;
        }

        await booking.save();

        // Free the vehicle if already assigned
        if (booking.vehicleId) {
            const vehicle = await Vehicle.findById(booking.vehicleId);
            if (vehicle) {
                vehicle.isBooked = false;
                await vehicle.save();
            }
        }

        res.status(200).json({
            success: true,
            message: "Emergency stop executed successfully.",
            booking,
        });
    } catch (error) {
        console.error("Error during emergency stop:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// Complete a booking
export const completeBooking = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId).populate('campus');

        if (!booking) {
            res.status(404).json({ success: false, error: "Booking not found" });
        return;
        }

        booking.status = "completed";
        await booking.save();

        if (booking.vehicleId) {
            const vehicle = await Vehicle.findById(booking.vehicleId);
            if (vehicle) {
                vehicle.isBooked = false;
                await vehicle.save();
            }
        }

         res.status(200).json({ success: true, message: "Booking completed", booking });
    } catch (error) {
        console.error("Error completing booking:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// get past bookings

export const getPastBookingsByUserId = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            res.status(400).json({ success: false, error: "Valid user ID is required" });
            return;
        }


        const pastStatuses = ["completed", "cancelled", "emergency"];

        const bookings = await Booking.find({
            userId: userId,
            status: { $in: pastStatuses },
        })
            .sort({ schedule: -1 })
            .populate('campus');

        console.log(`Fetched ${bookings.length} past bookings for userId: ${userId}`);

        res.status(200).json({
            success: true,
            message: "Past bookings fetched successfully.",
            bookings,
        });
    } catch (error) {
        console.error("Error fetching past bookings:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};


export const getUpcomingBookingsByUserId = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ success: false, error: "Valid user ID is required" });
            return;
        }

        const now = new Date();

        const bookings = await Booking.find({
            userId,
            schedule: { $gte: now },
        }).sort({ schedule: 1 }).populate('campus');

        res.status(200).json({
            success: true,
            message: "Upcoming bookings fetched successfully.",
            bookings,
        });
    } catch (error) {
        console.error("Error fetching upcoming bookings:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};


