const { pool } = require('../config/db');
const { registrarAccion } = require('../utils/logger');

// 1. OBTENER CONFIGURACIÓN
exports.getConfig = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Configuracion" LIMIT 1');
        if (result.rows.length === 0) {
            return res.json({ 
                NombreTienda: 'Mi Tienda', 
                Direccion: '', 
                Telefono: '', 
                MensajeTicket: '',
                RedSocial: ''
            });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener configuración:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

// 2. ACTUALIZAR CONFIGURACIÓN
exports.updateConfig = async (req, res) => {
    const { 
        NombreTienda, 
        Direccion, 
        Telefono, 
        MensajeTicket, 
        RedSocial,
        LogoUrl 
    } = req.body;
    const IdUsuario = req.user.IdUsuario;
    try {
        const query = `
            UPDATE "Configuracion"
            SET "NombreTienda" = $1,
                "Direccion" = $2,
                "Telefono" = $3,
                "MensajeTicket" = $4,
                "RedSocial" = $5,
                "LogoUrl" = $6
            WHERE "IdConfig" = (SELECT "IdConfig" FROM "Configuracion" LIMIT 1)
            RETURNING *;
        `;
        const result = await pool.query(query, [
            NombreTienda, Direccion, Telefono, MensajeTicket, RedSocial, LogoUrl
        ]);
        // Registrar en bitácora
        if (IdUsuario) {
            await registrarAccion(IdUsuario, 'CONFIG_UPDATE', 'Actualizó los datos generales de la tienda');
        }
        res.json({ msg: 'Configuración actualizada correctamente', config: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar configuración:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};