import mongoose, {Schema} from "mongoose";

export const LatLngSchema = new Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
}, { _id: false });

const LatLng = mongoose.model("latlng", LatLngSchema);

export default LatLng;
