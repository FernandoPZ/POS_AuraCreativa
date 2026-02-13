const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const { registrarAccion } = require('../utils/logger');

// 1. OBTENER USUARIOS
exports.getUsuarios = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT "IdUsuario",
                   "Nombre",
                   "Email",
                   "Rol",
                   "FechaCreacion"
                FROM "Usuario" 
                WHERE "Activo" = true
                ORDER BY "Nombre" ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Error SQL:", error.message);
        res.status(500).json({ msg: 'Error al obtener usuarios' });
    } finally {
        client.release();
    }
};

// 2. OBTENER UN USUARIO POR ID
exports.getUsuarioById = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT "IdUsuario",
                   "Nombre",
                   "Email",
                   "Rol" 
                FROM "Usuario" 
                WHERE "IdUsuario" = $1 AND "Activo" = true
        `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error SQL:", error.message);
        res.status(500).json({ msg: 'Error al obtener el usuario' });
    } finally {
        client.release();
    }
};

// 3. CREAR USUARIO
exports.createUsuario = async (req, res) => {
    const idAdmin = req.user ? req.user.IdUsuario : null;
    const { Nombre, Email, Password, Rol } = req.body;
    const nombreFinal = Nombre || req.body.nombre;
    const correoFinal = Email || req.body.email;
    const passwordFinal = Password || req.body.password;
    const rolFinal = Rol || req.body.rol || 'Vendedor';

    if (!nombreFinal || !correoFinal || !passwordFinal) {
        return res.status(400).json({ msg: 'Faltan datos obligatorios.' });
    }

    const client = await pool.connect();
    try {
        const check = await client.query('SELECT * FROM "Usuario" WHERE "Email" = $1', [correoFinal]);
        if (check.rows.length > 0) {
            return res.status(400).json({ msg: 'El correo ya está registrado' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(passwordFinal, salt);
        const query = `
            INSERT INTO "Usuario" ("Nombre", "Email", "PasswordHash", "Rol", "FechaCreacion", "Activo")
                VALUES ($1, $2, $3, $4, NOW(), TRUE)
                RETURNING "IdUsuario", "Nombre", "Email", "Rol"
        `;
        const result = await client.query(query, [nombreFinal, correoFinal, hashPassword, rolFinal]);
        
        if (idAdmin) {
            await registrarAccion(idAdmin, 'CREAR_USUARIO', `Creó al usuario: ${nombreFinal} (${correoFinal})`);
        }
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error SQL:", error.message);
        res.status(500).json({ msg: 'Error al crear usuario' });
    } finally {
        client.release();
    }
};

// 4. ACTUALIZAR USUARIO
exports.updateUsuario = async (req, res) => {
    const { id } = req.params;
    const idAdmin = req.user ? req.user.IdUsuario : null;
    const { Nombre, Email, Rol, Password } = req.body;
    const nombreFinal = Nombre || req.body.nombre;
    const correoFinal = Email || req.body.email;
    const passwordFinal = Password || req.body.password;
    const rolFinal = Rol || req.body.rol;

    if (!nombreFinal || !correoFinal) return res.status(400).json({ msg: 'El Nombre y Correo son obligatorios' });

    const client = await pool.connect();
    try {
        let query = '';
        let values = [];
        if (passwordFinal && passwordFinal.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(passwordFinal, salt);
            query = `UPDATE "Usuario" SET "Nombre"=$1, "Email"=$2, "Rol"=$3, "PasswordHash"=$4, "FechaModificacion"=NOW() WHERE "IdUsuario"=$5`;
            values = [nombreFinal, correoFinal, rolFinal, hashPassword, id];
        } else {
            query = `UPDATE "Usuario" SET "Nombre"=$1, "Email"=$2, "Rol"=$3, "FechaModificacion"=NOW() WHERE "IdUsuario"=$4`;
            values = [nombreFinal, correoFinal, rolFinal, id];
        }

        await client.query(query, values);
        
        if (idAdmin) {
            await registrarAccion(idAdmin, 'EDITAR_USUARIO', `Modificó datos del usuario ID ${id} (${correoFinal})`);
        }
        
        res.json({ msg: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error("❌ Error SQL:", error.message);
        res.status(500).json({ msg: 'Error al actualizar: ' + error.message });
    } finally {
        client.release();
    }
};

// 5. ELIMINAR USUARIO
exports.deleteUsuario = async (req, res) => {
    const { id } = req.params;
    const idAdmin = req.user ? req.user.IdUsuario : null;

    if (parseInt(id) === parseInt(idAdmin)) {
        return res.status(400).json({ msg: 'No puedes eliminar tu propio usuario.' });
    }

    const client = await pool.connect();
    try {
        await client.query('UPDATE "Usuario" SET "Activo" = FALSE WHERE "IdUsuario" = $1', [id]);
        
        if (idAdmin) {
            await registrarAccion(idAdmin, 'ELIMINAR_USUARIO', `Dio de baja al usuario con ID ${id}`);
        }
        
        res.json({ msg: 'Usuario dado de baja correctamente' });
    } catch (error) {
        console.error("Error SQL:", error.message);
        res.status(500).json({ msg: 'Error al eliminar usuario' });
    } finally {
        client.release();
    }
};