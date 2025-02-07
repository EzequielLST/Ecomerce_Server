import { Router } from "express";
import passport from "passport";
import { loginUser } from "../controllers/sessions.controller.js";

const router = Router();

// Ruta protegida que devuelve los datos del usuario logueado
router.get("/current", passport.authenticate("jwt", { session: false }), (req, res) => {
    res.json({ status: "success", user: req.user });
});

router.post("/login", loginUser);  // Ruta para hacer login y generar JWT

export default router;
