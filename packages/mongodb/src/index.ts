import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js"
import { Channel,Audio,Message} from "./models/channel.model.js"
dotenv.config();

const MONGO_URI = process.env.MONGO_URI!;
let retryAttempt = 0;
const RETRY_LOW = 1000;
const RETRY_MAX = 30000;
const MAX_RETRIES = 10;

let db: typeof mongoose;

function backoffDelay(attempt: number): number {
  return Math.min(RETRY_LOW * 2 ** attempt, RETRY_MAX);
}
function attachMongoLogs() {
  mongoose.connection.on("connected", () => {
    console.log("[mongodb] connected");
  });

  mongoose.connection.on("disconnected", () => {
    console.log("[mongodb] disconnected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[mongodb] error", err);
  });
}

async function connectDB(): Promise<typeof mongoose> {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    retryAttempt = 0;
    db = conn;
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

    await new Promise(res => setTimeout(res, delay));
    await connectDB();
    return db
  }
}

async function connectToDB(): Promise<typeof mongoose> {
  if (db) return db;
  await connectDB();
  return db
}
await connectToDB()
export {Channel,Audio,Message,User,connectToDB,attachMongoLogs}