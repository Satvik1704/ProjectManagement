import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Basic configuration
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH","DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"]
}))


// Import the routes 

import healthCheckRouter from "./routes/healthroutes.js";

import authRouter from "./routes/auth.routes.js"


app.use("/api/v1/healthcheck", healthCheckRouter)

app.use("/api/v1/auth", authRouter);

app.get("/", (req,res) =>{
    res.send("Welcome to the  base server")
})


export default app;
