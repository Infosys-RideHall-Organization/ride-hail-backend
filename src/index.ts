import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route";
import {errorHandler} from "./utils/error-handler";
import './db';

dotenv.config();
const app = express();

// middlewares
app.use(errorHandler);
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());

// Root health check
app.get("/", (_req, res) => {
    res.status(200).json({
        service: "RideHail API",
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime().toFixed(2) + "s",
    });
});


//routes
app.use('/api/auth', authRouter);

app.listen(process.env.PORT, () => {
    console.log("Server listening on port: " + process.env.PORT);
});

