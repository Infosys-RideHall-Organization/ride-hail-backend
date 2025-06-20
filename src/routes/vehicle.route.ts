// routes/vehicleRoutes.ts
import express from "express";
import {createVehicle, getAllVehicles, getVehicleById, updateVehicleLocation,assignDriverToVehicle,getVehicleByDriverId} from "../controllers/vehicle.controller";

const vehicleRouter = express.Router();

vehicleRouter.post("/create-vehicle", createVehicle);
vehicleRouter.post("/assign-driver", assignDriverToVehicle);
vehicleRouter.get("/", getAllVehicles);
vehicleRouter.get('/:id', getVehicleById);
vehicleRouter.get('/driver/:driverId', getVehicleByDriverId);
vehicleRouter.post("/location/update", updateVehicleLocation);

export default vehicleRouter;
