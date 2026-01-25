import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayLoad {
    userId: string;
}


export const protect = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer")){
        res.status(401).json({ message: "Not authorized "});
        return;
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify( 
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayLoad;
        req.user = { id: decoded.userId };
        next();  
    }catch (error) {
        res.status(401).json({ message: "Invalid Token"});
    }
};