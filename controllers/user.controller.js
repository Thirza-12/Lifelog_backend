import cloudinary from "../lib/cloudinary.js";
import { comparePassword, generateToken, hashPassword } from "../lib/authUtils.js";
import User from "../models/user.model.js";

// Signup
export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username.trim() || !email.trim() || !password.trim()) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (username.includes(" ")) {
      return res.status(400).json({ message: "Username cannot contain spaces" });
    }

    if (/\s/.test(password)) {
      return res.status(400).json({ message: "Password cannot contain spaces" });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await hashPassword(password.trim());
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();
    generateToken(newUser._id, res);

    res.status(201).json({
      message: "Signup successful!",
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });

  } catch (error) {
    console.error("Error in signup controller:", error.message);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username is already taken. Try a different one." });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Login
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      const isPasswordCorrect = await comparePassword(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      generateToken(user._id, res);
  
      res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      });
    } catch (error) {
      console.log("Error in login controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
};

// Logout
export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    req.user = null; // Clear user reference for immediate effect
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Get Profile
export const getProfile = async (req, res) => {
  try {
      const userId = req.user._id;

      const user = await User.findById(userId).select("-password"); // Exclude password
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
          _id: user._id,
          username: user.username,
          email: user.email,
          profilePic: user.profilePic,
          createdAt: user.createdAt,
      });
  } catch (error) {
      console.error("Error in getProfile controller:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
      const { profilePic } = req.body;
      const userId = req.user._id;

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      // If profilePic is empty (remove picture request)
      if (!profilePic) {
          // Delete the existing image from Cloudinary
          if (user.profilePic) {
              const publicId = user.profilePic.split("/").pop().split(".")[0];
              await cloudinary.uploader.destroy(publicId); // Delete old image
          }

          // Set profilePic to empty (default avatar)
          const updatedUser = await User.findByIdAndUpdate(
              userId,
              { profilePic: "" }, // Default avatar
              { new: true }
          );

          return res.status(200).json(updatedUser);
      }

      // If profilePic is being uploaded
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
          width: 300,
          height: 300,
          crop: "limit",
          quality: "auto",
          fetch_format: "auto",
      });

      const updatedUser = await User.findByIdAndUpdate(
          userId,
          { profilePic: uploadResponse.secure_url },
          { new: true }
      );

      res.status(200).json(updatedUser);
  } catch (error) {
      console.error("Error in update profile:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ valid: false }); // Force logout if no user is set
  }
  res.status(200).json({ valid: true, user: req.user });
};

