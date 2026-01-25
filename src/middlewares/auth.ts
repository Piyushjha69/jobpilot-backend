import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayLoad {
    userId: string;
}

interface AuthRequest extends Request {
    user?: { id: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayLoad;
        
        req.user = { id: decoded.userId };
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid Token" });
    }
};