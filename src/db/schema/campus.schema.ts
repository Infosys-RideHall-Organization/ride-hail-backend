import mongoose, {Schema} from "mongoose";
import {ICampus} from "../../interfaces/campus.interface";

const campusSchema = new Schema<ICampus>({
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
});

export const Campus = mongoose.model<ICampus>('Campus', campusSchema);