import {oneSignalClient} from "../utils/one-signal";
import OneSignal from "onesignal-node";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

// Test Notification, send to all
export const testNotification = async ()=>{
    const notification = {
        contents: {
            en: '🚀 This is a test push notification to all users!',
        },
        included_segments: ['All'], // Sends to all users
        headings: {
            en: 'Test Notification',
        },
    };

    try {
        const response = await oneSignalClient.createNotification(notification);
        console.log('Notification sent successfully:', response.body);
    } catch (error: any) {
        if (error instanceof OneSignal.HTTPError) {
            console.error('OneSignal API error:', error.statusCode, error.body);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}


// Utility to send notification via OneSignal
export const sendBookingNotificationToDrivers = async (bookingId: string) => {
    try {
        console.log("In notification");
        const appId = String(process.env.ONESIGNAL_APP_ID);
        const apiKey = String(process.env.ONESIGNAL_API_KEY);
        await axios.post(
            "https://onesignal.com/api/v1/notifications",
            {
                app_id: appId,
                included_segments: ["Drivers"],
                headings: { en: "New Booking Request" },
                contents: { en: "A new booking is available. Tap to accept." },
                data: {
                    bookingId,
                },
                // buttons: [
                //     {
                //         id: "accept",
                //         text: "Accept",
                //     },
                // ],
            },
            {
                headers: {
                    Authorization: `Basic ${apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        ).then((response) => {
            if(response.status === 200) {
                console.log(`Notification sent for booking ${bookingId}`);
            }
            else{
                console.log(`Failed to send notification!`);
            }
        });

    } catch (err) {
        console.error("OneSignal error:", err);

    }
};

//testNotification();
export const sendScheduledNotificationToDriver = async (
    bookingId: string,
    driverPlayerId: string,
    scheduleTimeISO: string
) => {
    try {
        console.log("Scheduling notification...");

        const appId = String(process.env.ONESIGNAL_APP_ID);
        const apiKey = String(process.env.ONESIGNAL_API_KEY);

        const response = await axios.post(
            "https://onesignal.com/api/v1/notifications",
            {
                app_id: appId,
                include_player_ids: [driverPlayerId],
                send_after: scheduleTimeISO,
                headings: { en: "Upcoming Ride" },
                contents: { en: "Reminder: Your scheduled ride is about to start." },
                data: {
                    bookingId,
                    type: "scheduled_reminder"
                }
            },
            {
                headers: {
                    Authorization: `Basic ${apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.status === 200) {
            console.log(`Scheduled notification for booking ${bookingId} at ${scheduleTimeISO}`);
        } else {
            console.log("Failed to schedule notification!");
        }
    } catch (err) {
        console.error("OneSignal scheduling error:", err);
    }
};
