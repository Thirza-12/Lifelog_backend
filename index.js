import express from "express";
import userRoutes from "./routes/userRoutes.js";
import entryRoutes from "./routes/entryRoutes.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
const app=express();
import cors from "cors";

// Routes
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json({ limit: "10mb" })); 

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(cookieParser());
app.use("/api/auth", userRoutes);
app.use("/api/entry", entryRoutes);
app.listen(8080, ()=>{
    console.log("App running at 8080");
    connectDB();
});
