import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../utils/jwt";
import { IJwtPayload } from "../models/JwtPayload";


export interface AuthRequest extends Request {
  user?: IJwtPayload;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {

  const authHeader = req.headers["authorization"]; // Para leer el header de la peticion, la parte de Authorization

  const token = authHeader && authHeader.split(" ")[1]; // Aqui separa el token del header

  if (!token) {
    return res.status(401).json({ message: "Token requerido" }); // Si no hay token, retorna un error 401 (Unauthorized)
  }

  try {
    const decoded = verifyAccessToken(token); // Verifica el access token
    req.user = decoded;

    // Si el rol del usuario no es admin, retorna un error 403 (Forbidden)
    if (req.user.rol !== 'admin') {
      return res.status(401).json({ message: "Acceso denegado" });
    }

    next(); // Si todo esta bien, pasa a la siguiente ruta
  } catch (err: any) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Access token expirado" });
    }

    return res.status(401).json({ message: "Token inválido" });
  }
};