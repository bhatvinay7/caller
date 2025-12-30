import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
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
  app.listen(PORT,"0.0.0.0",() => {
    console.log(`Server running on port ${PORT}`);
  });
