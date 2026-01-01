import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middleware/auth.middleware.js";
import authRouter from "./routers/user.auth.router.js"
import userRouter from "./routers/user.router.js"
import {connectToDB,attachMongoLogs} from 'mongodb';
dotenv.config();
  const app = express();
  const PORT =  3002;

  const options = cors({
    origin: [process.env.NEXT_PUBLIC_FRONTEND_URL!],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE","PATCH", "OPTIONS"],
  });
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(options);
  app.use("/api/v1", authRouter)
  app.use("/api/v1",authMiddleware as any)
  app.use("/api/v1",userRouter)
  app.listen(PORT,"0.0.0.0",() => {
    console.log(`Server running on port ${PORT}`);
  });
  
try{
 (async ()=>{
  await connectToDB()
  attachMongoLogs()
 })()
}
catch(error){
  console.log(error)
}