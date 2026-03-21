import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Usuario from '../models/Usuario';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export const validateUserCredentials = async (email: string, password: string) => {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return null;

    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) return null;

    return usuario;
};

export const getTokens = (usuario: any) => {
    const accessToken = generateAccessToken(
        String(usuario._id),
        usuario.name,
        usuario.email,
        usuario.organizacion as mongoose.Types.ObjectId,
        usuario.rol
    );
    const refreshToken = generateRefreshToken(
        String(usuario._id),
        usuario.name,
        usuario.email,
        usuario.organizacion as mongoose.Types.ObjectId,
        usuario.rol
    );

    return { accessToken, refreshToken };
};

export const refreshUserSession = async (incomingRefreshToken: string) => {
    const payload = verifyRefreshToken(incomingRefreshToken);
    const usuario = await Usuario.findById(payload.id);
    
    if (!usuario) throw new Error('Usuario no encontrado');

    const tokens = getTokens(usuario);
    return tokens;
};
