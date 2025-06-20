// routes/vehicleRoutes.ts
import express from "express";
import {
    createBooking,
    getBookingsByUserId,
    assignVehicleToBooking,
    getBookingById,
    verifyBookingOtp,
    updateBookingStatus,
    cancelBooking,
    emergencyStopBooking,
    completeBooking,
    getPastBookingsByUserId,
    getUpcomingBookingsByUserId
} from "../controllers/booking.controller";

const bookingRouter = express.Router();

bookingRouter.post("/",createBooking);
bookingRouter.post("/assign-vehicle/:bookingId",assignVehicleToBooking);
bookingRouter.get("/all-bookings/:userId", getBookingsByUserId);
bookingRouter.get("/:bookingId", getBookingById);
bookingRouter.post("/verify-otp/:bookingId",  verifyBookingOtp);
bookingRouter.post("/update-status/:bookingId",  updateBookingStatus);
bookingRouter.post("/cancel/:bookingId",  cancelBooking);
bookingRouter.post("/emergency-stop/:bookingId",  emergencyStopBooking);
bookingRouter.post("/complete/:bookingId",  completeBooking);
bookingRouter.get("/past/:userId",  getPastBookingsByUserId);
bookingRouter.get("/upcoming/:userId",  getUpcomingBookingsByUserId);

export default bookingRouter;
