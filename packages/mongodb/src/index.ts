import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js"
dotenv.config();
let retryAttempt = 0;

const RETRY_LOW = 1000
const RETRY_MAX = 30000
const MAX_RETRIES = 10
let db: typeof mongoose
function backoffDelay(attempt: number): number {
    const delay = RETRY_LOW * 2 ** attempt
    return Math.min(delay, RETRY_MAX);
}
const MONGO_URI = process.env.MONGO_URI!
async function connectDB(): Promise<typeof mongoose> {
    try {
        if (!MONGO_URI) {
            console.log("provide mongodb connection string")
        }
        const conn = await mongoose.connect(MONGO_URI);
        conn.connection.on('connected', () => {
            console.log('Mongoose connection is open to DB');
        });

        conn.connection.on('error', (err) => {
            console.error(`Mongoose connection error: ${err}`);
        });

        conn.connection.on('disconnected', () => {
            console.log('Mongoose connection is disconnected');
        });
        db = conn
        retryAttempt = 0;
        return conn;
    } catch (error) {
        retryAttempt++;

        if (retryAttempt > MAX_RETRIES) {
            console.error("MongoDB connection failed after max retries");
            throw error;
        }

        const delay = backoffDelay(retryAttempt);
        console.error(
            `MongoDB connection failed. Retrying in ${delay}ms (attempt ${retryAttempt})`
        );

        await new Promise((res) => setTimeout(res, delay));
        // add exponenstial backoff
        return connectDB();
    }
}
export default async function connectToDB(): Promise<typeof mongoose> {
    if (db) {
        return db
    }
    return connectDB();
}
export {User}