import { Server as IOServer } from "socket.io";
import http from "http";

export const initSocket = (server: http.Server) => {
    const io = new IOServer(server, {
        cors: { origin: "*" },
    });

    // Track active drivers and users
    const activeDrivers = new Map(); // vehicleId -> socketId
    const activeUsers = new Map(); // userId -> socketId
    const bookingDriverMap = new Map(); // bookingId -> vehicleId
    const bookingUserMap = new Map(); // bookingId -> userId

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Driver joins with vehicle ID
        socket.on('joinDriver', (vehicleId) => {
            console.log(`Driver joined with vehicle ID: ${vehicleId}`);
            activeDrivers.set(vehicleId, socket.id);
            socket.join(`driver:${vehicleId}`);
        });

        // User joins with user ID and booking ID
        socket.on('joinUser', (data) => {
            const { userId, bookingId } = data;
            console.log(`User joined: ${socket.id}, userId: ${userId}, bookingId: ${bookingId}`);

            activeUsers.set(userId, socket.id);
            socket.join('users');
            socket.join(`user:${userId}`);

            if (bookingId) {
                bookingUserMap.set(bookingId, userId);
                socket.join(`booking:${bookingId}`);
            }
        });

        // Driver joins a specific booking
        socket.on('joinBooking', (data) => {
            const { vehicleId, bookingId } = data;
            console.log(`Driver with vehicle ${vehicleId} joined booking: ${bookingId}`);

            bookingDriverMap.set(bookingId, vehicleId);
            socket.join(`booking:${bookingId}`);
        });

        // Driver sends location update
        socket.on('sendLocation', (data) => {
            console.log(`Location update from vehicle ${data.vehicleId}: ${JSON.stringify(data.location)}`);

            // Broadcast to all users
            io.to('users').emit('sendLocation', data);
        });

        // Driver sends OTP verification status to user
        socket.on('otpVerified', (data) => {
            const { bookingId, vehicleId, otpVerified, message } = data;
            console.log(`OTP verification from vehicle ${vehicleId} for booking ${bookingId}: ${otpVerified}`);

            // Send to specific booking room (user will be in this room)
            socket.to(`booking:${bookingId}`).emit('otpVerificationStatus', {
                bookingId,
                vehicleId,
                otpVerified,
                message: message || (otpVerified ? 'OTP verified successfully! Your ride has started.' : 'OTP verification failed.'),
                timestamp: new Date().toISOString()
            });

            // Also send to all users as a fallback
            io.to('users').emit('otpVerificationStatus', {
                bookingId,
                vehicleId,
                otpVerified,
                message: message || (otpVerified ? 'OTP verified successfully! Your ride has started.' : 'OTP verification failed.'),
                timestamp: new Date().toISOString()
            });
        });

        // Driver updates ride status
        socket.on('rideStatusUpdate', (data) => {
            const { bookingId, vehicleId, status, message } = data;
            console.log(`Ride status update from vehicle ${vehicleId} for booking ${bookingId}: ${status}`);

            // Send to specific booking room
            socket.to(`booking:${bookingId}`).emit('rideStatusChanged', {
                bookingId,
                vehicleId,
                status,
                message,
                timestamp: new Date().toISOString()
            });
        });

        // Driver arrived at pickup location
        socket.on('driverArrived', (data) => {
            const { bookingId, vehicleId, location } = data;
            console.log(`Driver arrived at pickup for booking ${bookingId}`);

            socket.to(`booking:${bookingId}`).emit('driverArrivedAtPickup', {
                bookingId,
                vehicleId,
                location,
                message: 'Your driver has arrived at the pickup location',
                timestamp: new Date().toISOString()
            });
        });

        // Driver completed the ride
        socket.on('rideCompleted', (data) => {
            const { bookingId, vehicleId, completionData } = data;
            console.log(`Ride completed for booking ${bookingId}`);

            socket.to(`booking:${bookingId}`).emit('rideCompletedNotification', {
                bookingId,
                vehicleId,
                completionData,
                message: 'Your ride has been completed successfully',
                timestamp: new Date().toISOString()
            });

            // Clean up booking mappings
            bookingDriverMap.delete(bookingId);
            bookingUserMap.delete(bookingId);
        });

        // User requests driver location
        socket.on('requestDriverLocation', (data) => {
            const { bookingId } = data;
            const vehicleId = bookingDriverMap.get(bookingId);

            if (vehicleId) {
                const driverSocketId = activeDrivers.get(vehicleId);
                if (driverSocketId) {
                    io.to(driverSocketId).emit('locationRequested', { bookingId });
                }
            }
        });

        // FIXED: User cancels ride - emit event that driver expects
        socket.on('cancelRide', (data) => {
            const { bookingId, userId, message } = data;
            console.log(`Ride cancelled by user for booking ${bookingId}`);

            // Get the vehicle ID for this booking
            const vehicleId = bookingDriverMap.get(bookingId);

            // Emit to the specific booking room - THIS IS WHAT THE DRIVER IS LISTENING FOR
            io.to(`booking:${bookingId}`).emit('cancelRide', {
                bookingId,
                userId,
                vehicleId,
                message: message || 'Ride Cancelled By User',
                timestamp: new Date().toISOString(),
                cancelledBy: 'user'
            });

            // Also emit the alternative event name in case driver is listening for this
            io.to(`booking:${bookingId}`).emit('rideCancelled', {
                bookingId,
                userId,
                vehicleId,
                message: message || 'Ride cancelled by user',
                timestamp: new Date().toISOString(),
                cancelledBy: 'user'
            });

            // Send status update event as well
            io.to(`booking:${bookingId}`).emit('rideStatusChanged', {
                bookingId,
                vehicleId,
                status: 'cancelled',
                message: message || 'Ride cancelled by user',
                timestamp: new Date().toISOString()
            });

            console.log(`Cancellation events sent to booking room: booking:${bookingId}`);
            console.log(`Active drivers: ${Array.from(activeDrivers.keys())}`);
            console.log(`Booking driver mapping: ${vehicleId ? `Found vehicle ${vehicleId}` : 'No vehicle found'}`);

            // Clean up booking mappings
            bookingDriverMap.delete(bookingId);
            bookingUserMap.delete(bookingId);
        });

        // ENHANCED: Emergency stop with better event handling
        socket.on('emergencyStop', (data) => {
            const { bookingId, userId, message } = data;
            console.log(`Emergency stop triggered by user for booking ${bookingId}`);

            const vehicleId = bookingDriverMap.get(bookingId);

            // Send emergency stop event that driver expects
            io.to(`booking:${bookingId}`).emit('emergencyStop', {
                bookingId,
                userId,
                vehicleId,
                message: message || 'Emergency stop triggered by user',
                timestamp: new Date().toISOString(),
            });

            // Also send alternative event name
            io.to(`booking:${bookingId}`).emit('emergencyStopTriggered', {
                bookingId,
                userId,
                vehicleId,
                message: message || 'Emergency stop triggered by user',
                timestamp: new Date().toISOString(),
            });

            // Send status update
            io.to(`booking:${bookingId}`).emit('rideStatusChanged', {
                bookingId,
                vehicleId,
                status: 'emergency_stopped',
                message: message || 'Emergency stop triggered',
                timestamp: new Date().toISOString()
            });

            // Clean up booking mappings
            bookingDriverMap.delete(bookingId);
            bookingUserMap.delete(bookingId);
        });




        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);

            // Clean up activeUsers
            for (const [userId, socketId] of activeUsers.entries()) {
                if (socketId === socket.id) {
                    activeUsers.delete(userId);
                    break;
                }
            }

            // Clean up activeDrivers
            for (const [vehicleId, socketId] of activeDrivers.entries()) {
                if (socketId === socket.id) {
                    activeDrivers.delete(vehicleId);
                    break;
                }
            }
        });

        // Utility function to get active connections info
        socket.on('getActiveConnections', () => {
            socket.emit('activeConnectionsInfo', {
                activeDrivers: Array.from(activeDrivers.keys()),
                activeUsersCount: activeUsers.size,
                activeBookings: Array.from(bookingDriverMap.keys())
            });
        });
    });

    return io;
};