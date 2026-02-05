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
                RedSocial: '',
                LogoUrl: null
            });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener configuración:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

// 2. ACTUALIZAR (O CREAR) CONFIGURACIÓN
exports.updateConfig = async (req, res) => {
    const { 
        NombreTienda, 
        Direccion, 
        Telefono, 
        MensajeTicket, 
        RedSocial 
    } = req.body;
    const IdUsuario = req.user.IdUsuario;
    const logoNuevo = req.file ? req.file.filename : null;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const checkRes = await client.query('SELECT "IdConfig", "LogoUrl" FROM "Configuracion" LIMIT 1');
        let result;
        if (checkRes.rows.length === 0) {
            const insertQuery = `
                INSERT INTO "Configuracion" 
                ("NombreTienda", "Direccion", "Telefono", "MensajeTicket", "RedSocial", "LogoUrl")
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *;
            `;
            result = await client.query(insertQuery, [
                NombreTienda, Direccion, Telefono, MensajeTicket, RedSocial, logoNuevo
            ]);
        } else {
            const currentConfig = checkRes.rows[0];
            const logoFinal = logoNuevo || currentConfig.LogoUrl;
            const updateQuery = `
                UPDATE "Configuracion"
                    SET "NombreTienda" = $1,
                        "Direccion" = $2,
                        "Telefono" = $3,
                        "MensajeTicket" = $4,
                        "RedSocial" = $5,
                        "LogoUrl" = $6
                    WHERE "IdConfig" = $7
                    RETURNING *;
            `;
            result = await client.query(updateQuery, [
                NombreTienda, Direccion, Telefono, MensajeTicket, RedSocial, logoFinal, currentConfig.IdConfig
            ]);
        }
        await client.query('COMMIT');
        if (IdUsuario) {
            await registrarAccion(IdUsuario, 'CONFIG_UPDATE', 'Actualizó los datos generales y/o logo de la tienda');
        }
        res.json({ msg: 'Configuración guardada correctamente', config: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al actualizar configuración:', error);
        res.status(500).json({ msg: 'Error del servidor al guardar configuración' });
    } finally {
        client.release();
    }
};