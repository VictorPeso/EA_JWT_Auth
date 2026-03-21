import mongoose, { Document, Schema } from 'mongoose';

import bcrypt from 'bcryptjs';

export interface IUsuario {
    name: string;
    email: string;
    password: string;
    organizacion: mongoose.Types.ObjectId | string;
    //rol: 'admin' | 'commoner';
}

export interface IUsuarioModel extends IUsuario, Document {}

const UsuarioSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        organizacion: { type: Schema.Types.ObjectId, required: true, ref: 'Organizacion' }
        //rol: { type: String, enum: ['admin', 'commoner'], default: 'commoner' }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

UsuarioSchema.pre<IUsuarioModel>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

export default mongoose.model<IUsuarioModel>('Usuario', UsuarioSchema);
