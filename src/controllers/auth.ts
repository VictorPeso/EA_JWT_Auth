import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';
import * as authService from '../services/auth';
import { AuthRequest } from '../middleware/auth';
import Usuario from '../models/Usuario';

/**
 * POST /auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    try {
        const usuario = await authService.validateUserCredentials(email, password);
        
        if (!usuario) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const { accessToken, refreshToken } = authService.getTokens(usuario);

        res.cookie(config.cookies.refreshName, refreshToken, config.cookies.options);

        return res.status(200).json({
            message: 'Login exitoso',
            accessToken,
            usuario: {
                _id: usuario._id,
                name: usuario.name,
                email: usuario.email,
                organizacion: usuario.organizacion,
                rol: usuario.rol
            }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

/**
 * POST /auth/refresh
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const incomingRefreshToken = req.cookies?.[config.cookies.refreshName] || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ message: 'Refresh token requerido' });
        }

        const { accessToken, refreshToken: newRefreshToken } = await authService.refreshUserSession(incomingRefreshToken);

        res.cookie(config.cookies.refreshName, newRefreshToken, config.cookies.options);

        return res.status(200).json({
            message: 'Token refrescado',
            accessToken
        });
    } catch (error) {
        return res.status(401).json({ message: 'Refresh token expirado o inválido' });
    }
};

/**
 * POST /auth/logout
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie(config.cookies.refreshName, {
            ...config.cookies.options
        });

        return res.status(200).json({ message: 'Logout exitoso' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

/**
 * GET /auth/me
 */
export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const usuario = await Usuario.findById(req.user?.id).populate('organizacion');
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        return res.status(200).json(usuario);
    } catch (error) {
        return res.status(500).json({ error });
    }
};
