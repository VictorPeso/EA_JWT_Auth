export interface IJwtPayload {
    id: string;
    name: string;
    email: string;
    organizacion: string;
    rol: 'admin' | 'commoner';
}
