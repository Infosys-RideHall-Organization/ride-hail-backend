import { Client } from 'onesignal-node';
import dotenv from 'dotenv';
dotenv.config();

const appId = process.env.ONESIGNAL_APP_ID!;
const apiKey = process.env.ONESIGNAL_API_KEY!;

export const oneSignalClient = new Client(appId, apiKey);
