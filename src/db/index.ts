
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI!;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log(` Successfully connected to MongoDB: ${MONGO_URI}`);
    })
    .catch((err) => {
        console.error(" MongoDB connection error:", err);
    });

export default mongoose;
