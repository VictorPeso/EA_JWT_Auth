import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { config } from "../config/config";
import { IJwtPayload } from "../models/JwtPayload";

export const generateAccessToken = (userId: string, name: string, email: string, organizacion: mongoose.Types.ObjectId | string, rol: 'admin' | 'commoner') => {
    const payload: IJwtPayload = { id: userId, name, email, organizacion: String(organizacion), rol };
    return jwt.sign(
        payload,
        config.jwt.accessSecret,
        { expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions["expiresIn"] }
    );
};

export const generateRefreshToken = (userId: string, name: string, email: string, organizacion: mongoose.Types.ObjectId | string, rol: 'admin' | 'commoner') => {
    const payload: IJwtPayload = { id: userId, name, email, organizacion: String(organizacion), rol };
    return jwt.sign(
        payload,
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions["expiresIn"] }
    );
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, config.jwt.accessSecret) as IJwtPayload;
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, config.jwt.refreshSecret) as IJwtPayload;
};