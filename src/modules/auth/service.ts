import bcrypt from 'bcryptjs';
import UserModel, {type Iuser } from './modle.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/token.js';

interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

interface LoginInput {
    email: string;
    password: string;
}

export const registerService = async (
    input: RegisterInput
): Promise<{ user: Iuser; accessToken: string; refreshToken: string}>=> {
    const {name, email, password} = input;

    const existingUser = await UserModel.findOne({ email})

    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ name, email, password: hashedPassword });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshtoken = refreshToken;
    await user.save();

    return { user, accessToken, refreshToken};
};

   

export const loginService = async (
    input: LoginInput
): Promise<{ user: Iuser; accessToken: string; refreshToken: string}>=> {
    const{ email, password } = input;

    const user = await UserModel.findOne({ email });
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshtoken = refreshToken;
    await user.save();
    
    return { user, accessToken, refreshToken};
};

export const getUserProfileService = async (
    userId: string
): Promise<Iuser | null> => {
    const user = await UserModel.findById(userId).select('-password -refreshtoken');
    return user;
};

export const refreshTokenService = async (
    refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
    const jwt = await import('jsonwebtoken');
    const { JWT_REFRESH_SECRET } = await import('../../config/env.js');
    const { generateAccessToken, generateRefreshToken } = await import('../../utils/token.js');

    try {
        const decoded = jwt.default.verify(refreshToken, JWT_REFRESH_SECRET!) as { userId: string };
        
        const user = await UserModel.findById(decoded.userId);
        if (!user || user.refreshtoken !== refreshToken) {
            throw new Error('Invalid refresh token');
        }

        const newAccessToken = generateAccessToken(user._id.toString());
        const newRefreshToken = generateRefreshToken(user._id.toString());

        user.refreshtoken = newRefreshToken;
        await user.save();

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

