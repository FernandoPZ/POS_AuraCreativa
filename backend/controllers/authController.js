const { registrarAccion } = require('../utils/logger');
const { query } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTRAR USUARIO
exports.registerUser = async (req, res) => {
    const { nombre, email, password } = req.body;
    const ClaUserMod = 1; 
    const NombrePcMod = 'SERVIDOR_REG';
    const Activo = true; 
    if (!nombre || !email || !password) {
        return res.status(400).json({ msg: 'Todos los campos son obligatorios.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ msg: 'La contraseña debe tener al menos 6 caracteres.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ msg: 'El formato del email no es válido.' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const result = await query(
            `INSERT INTO "Usuario" ("Nombre", "Email", "PasswordHash", "Rol", "FechaUltMod", 
                                    "ClaUserMod", "NombrePcMod", "Activo", "FechaCreacion") 
                VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, NOW()) 
                RETURNING *`,
            [nombre, email, passwordHash, 'ADMIN', ClaUserMod, NombrePcMod, Activo]
        );
        res.status(201).json({ msg: 'Usuario registrado exitosamente', user: result.rows[0] });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        if (error.code === '23505') { 
             return res.status(400).json({ msg: 'El email ya está registrado.' });
        }
        res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};

// 2. LOGIN USUARIO
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ msg: 'Ingrese email y contraseña.' });
    }
    try {
        const result = await query(
            'SELECT * FROM "Usuario" WHERE "Email" = $1 AND "Activo" = true', 
            [email]
        );
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ msg: 'Usuario no encontrado.' });
        }
        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Credenciales inválidas.' });
        }
        const payload = {
            IdUsuario: user.IdUsuario,
            Rol: user.Rol,
            Email: user.Email
        };
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        await registrarAccion(user.IdUsuario, 'LOGIN', 'El usuario inició sesión en el sistema');
        res.json({
            token,
            user: {
                IdUsuario: user.IdUsuario,
                Nombre: user.Nombre,
                Email: user.Email,
                Rol: user.Rol
            }
        });
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};