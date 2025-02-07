import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        // 🔹 Generar Token JWT
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
            expiresIn: "1h",
        });

        // 🔹 Guardar Token en una cookie HTTP-only
        res.cookie("authToken", token, { httpOnly: true, secure: false, maxAge: 3600000 });

        res.json({ status: "success", token });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
};
