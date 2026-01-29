import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRY, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, REFRESH_TOKEN_EXPIRY } from "../config/env.js";

export const generateAccessToken = (userId: string): string => {

   return jwt.sign(
        {userId},
        JWT_ACCESS_SECRET!,
        { expiresIn: parseInt(ACCESS_TOKEN_EXPIRY!) },
    );
   
};

export const generateRefreshToken = (userId: string): string => {
    return jwt.sign(
        {userId},
        JWT_REFRESH_SECRET!,
        { expiresIn: parseInt(REFRESH_TOKEN_EXPIRY!) }
    );
};