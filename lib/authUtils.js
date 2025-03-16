import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

// Secret key for JWT (keep it in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Hash password before saving
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Compare entered password with hashed password
export const comparePassword = async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
};

// Generate JWT token
export const generateToken=(userId,res)=>{
    console.log(JWT_SECRET);
    const token=jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"7d"
    })
    res.cookie("jwt",token,{
        maxAge: 7*24*60*60*1000, // ms
        httpOnly:true, // prevent XSS attacks cross-site scripting attacks
        sameSite: "None", // CSRF attacks cross-site request forgery attacks
        secure: true,
        path: "/", 
    });
    return token;
}

