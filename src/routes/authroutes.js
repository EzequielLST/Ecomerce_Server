import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

// 📌 Registro de Usuario
router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Verificar si el usuario ya existe
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "El email ya está registrado" });

    // Crear nuevo usuario
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await UserModel.create({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Usuario registrado correctamente", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
});

// 📌 Login de Usuario
router.post("/login", async (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return res.status(500).json({ message: "Error en el servidor" });
    if (!user) return res.status(400).json({ message: info.message });

    // Generar Token JWT
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login exitoso", token });
  })(req, res, next);
});

// 📌 Ruta Protegida (Ejemplo)
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ message: "Perfil del usuario", user: req.user });
  }
);

export default router;
