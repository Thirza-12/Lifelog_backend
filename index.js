import express from "express";
import userRoutes from "./routes/userRoutes.js";
import entryRoutes from "./routes/entryRoutes.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app=express();
// Routes
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json({ limit: "10mb" })); 

app.use(cors({ origin: ["https://lifelog-diary.netlify.app","https://lifelog-1b8u.onrender.com"], credentials: true }));

app.use(cookieParser());
app.use("/api/auth", userRoutes);
app.use("/api/entry", entryRoutes);
app.listen(8080, ()=>{
    console.log("App running at 8080");
    connectDB();
});
