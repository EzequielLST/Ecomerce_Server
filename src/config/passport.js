import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import UserModel from "../models/UserModel.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";
const COOKIE_NAME = "authToken"; // Nombre de la cookie que almacena el token

// 🔹 Función para extraer el token desde la cookie
const cookieExtractor = (req) => {
    return req?.cookies ? req.cookies[COOKIE_NAME] : null;
};

// 🔹 Estrategia Local (Login con Email y Password)
passport.use(
    new LocalStrategy(
        { usernameField: "email", passwordField: "password" },
        async (email, password, done) => {
            try {
                const user = await UserModel.findOne({ email });
                if (!user) return done(null, false, { message: "Usuario no encontrado" });

                const isMatch = bcrypt.compareSync(password, user.password);
                if (!isMatch) return done(null, false, { message: "Contraseña incorrecta" });

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

// 🔹 Estrategia JWT (Autenticación con Token desde Cookie)
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]), // Extrae el token de la cookie
            secretOrKey: JWT_SECRET,
        },
        async (payload, done) => {
            try {
                const user = await UserModel.findById(payload.id).select("-password");
                if (!user) return done(null, false);
                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

export default passport;
