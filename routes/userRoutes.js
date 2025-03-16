import express from "express";
import {checkAuth, getProfile, login, logout, signup, updateProfile } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router=express.Router();


router.post("/signup", signup);
router.post("/login", login);
router.post("/logout",logout);
router.get("/profile",protectRoute,getProfile);
router.put("/update-profile",protectRoute, updateProfile);
router.get('/check-auth', protectRoute, checkAuth);

export default router;