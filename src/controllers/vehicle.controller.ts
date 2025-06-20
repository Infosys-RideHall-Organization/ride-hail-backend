import { Request, Response } from "express";
import Vehicle from "../db/schema/vehicle.schema";
import User from "../db/schema/user.schema";

// Default parking location
const DEFAULT_LOCATION = {
    lat: 12.8500784,
    lng: 77.6633549,
};

export const assignDriverToVehicle = async (req: Request, res: Response) => {
    try {
        const { vehicleId, driverId } = req.body;

        if (!vehicleId || !driverId) {
             res.status(400).json({
                success: false,
                error: "Both vehicleId and driverId are required.",
            });
             return;
        }

        // Check if the user exists
        const driver = await User.findById(driverId);
        if (!driver) {
             res.status(404).json({
                success: false,
                error: "Driver not found.",
            });
            return;
        }

        if (driver.role !== "driver") {
             res.status(400).json({
                success: false,
                error: "The specified user is not a driver.",
            });
             return;
        }

        // Check if this driver is already assigned to another vehicle
        const existingVehicle = await Vehicle.findOne({ driver: driverId });
        if (existingVehicle) {
             res.status(400).json({
                success: false,
                error: "This driver is already assigned to another vehicle.",
            });
             return;
        }

        // Assign the driver to the vehicle
        const vehicle = await Vehicle.findByIdAndUpdate(
            vehicleId,
            { driver: driverId },
            { new: true }
        ).populate("driver");

        if (!vehicle) {
            res.status(404).json({
                success: false,
                error: "Vehicle not found.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Driver assigned to vehicle successfully.",
            vehicle,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: "Internal Server Error.",
        });
    }
};

export const createVehicle = async (req: Request, res: Response) => {
    try {
        const { type, identifier, capacity } = req.body;

        // Validate vehicle type
        if (!["Buggy", "Transport Truck", "Bot"].includes(type)) {
            res.status(400).json({
                success: false,
                error: "Invalid vehicle type." });
            return;
        }

        // Validate identifier
        if (!identifier) {
             res.status(400).json({
                success: false,
                error: "Vehicle identifier is required." });
             return;
        }

        if(capacity.passengers>3 || capacity.items > 3) {
            res.status(400).json({
                success: false,
                error: "Maximum capacity is 3" });
            return;
        }

        const vehicle = new Vehicle({
            type,
            identifier,
            capacity: {
                passengers: capacity?.passengers || 0,
                items: capacity?.items || 0,
            },
            currentLocation: DEFAULT_LOCATION,
            isBooked: false,
        });

        await vehicle.save();
        res.status(201).json({
            success: true,
            message: "Vehicle created successfully.",
            vehicle
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

export const getAllVehicles = async (_req: Request, res: Response) => {
    try {
        const vehicles = await Vehicle.find();
        res.status(200).json({
            success:true,
            message: "Vehicles fetched successfully",
            vehicles
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            error: "Error fetching routes"
        });
    }
};

export const getVehicleById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const vehicle = await Vehicle.findById(id);

        if (!vehicle) {
             res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
             return;
        }

        res.status(200).json({
            success: true,
            message: "Vehicle fetched successfully",
            vehicle,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: "Error fetching vehicle",
        });
    }
};

export const updateVehicleLocation = async (req: Request, res: Response) => {
    const { identifier, lat, lng } = req.body;

    const vehicle = await Vehicle.findOneAndUpdate(
        { identifier },
        { currentLocation: { lat, lng } },
        { new: true }
    );

    if (vehicle) {
        // Emit update via Socket.IO
        req.app.get("io").emit("buggyLocation", {
            identifier,
            currentLocation: vehicle.currentLocation,
        });
        res.json({
            success: true,
            message: "Vehicle latest location updated successfully",
            vehicle});
    } else {
        res.status(404).json({ message: "Vehicle not found" });
    }
};

export const getVehicleByDriverId = async (req: Request, res: Response) => {
    try {
        const { driverId } = req.params;

        if (!driverId) {
             res.status(400).json({
                success: false,
                error: "Driver ID is required.",
            });
             return;
        }

        const vehicle = await Vehicle.findOne({ driver: driverId }).populate("driver","-password");

        if (!vehicle) {
             res.status(404).json({
                success: false,
                error: "No vehicle assigned to this driver.",
            });
             return;
        }

         res.status(200).json({
            success: true,
            message: "Vehicle fetched successfully.",
            vehicle,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: "Internal Server Error.",
        });
    }
};
