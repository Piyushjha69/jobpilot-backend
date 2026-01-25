import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel, {type Iuser } from './modle.js';

interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

interface LoginInput {
    email: string;
    password: string;
}

const generateAccessToken = (userId: string): string => {
    return jwt.sign({userId}, process.env.JWT_SECRET as string, {expiresIn: '1h'});
};

const generateRefreshToken = (userId: string): string => {
    return jwt.sign({userId}, process.env.JWT_SECRET as string, {expiresIn: '7d'});
};

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

    return { user, accessToken, refreshToken};
};

