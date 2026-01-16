const PDFDocument = require('pdfkit');
const { pool } = require('../config/db');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

exports.generarTicket = async (req, res) => {
    const { id } = req.params;

    const client = await pool.connect();
    try {
        const configRes = await client.query('SELECT * FROM "Configuracion" LIMIT 1');
        const config = configRes.rows[0] || {
            NombreTienda: 'Mi Tienda',
            Direccion: 'Sin dirección',
            Telefono: '',
            RedSocial: '',
            MensajeTicket: '¡Gracias por su compra!',
            LogoUrl: null
        };
        const ventaQuery = `
            SELECT v."IdVenta", v."Fecha", v."Total", v."ClienteNombre",
                   pe."NombrePunto", pe."LinkGoogleMaps",
                   u."Nombre" as "Vendedor"
            FROM "Ventas" v
            LEFT JOIN "Usuario" u ON v."IdUsuario" = u."IdUsuario"
            LEFT JOIN "PuntosEntrega" pe ON v."IdPuntoEntrega" = pe."IdPunto"
            WHERE v."IdVenta" = $1
        `;
        const ventaRes = await client.query(ventaQuery, [id]);
        if (ventaRes.rows.length === 0) {
            return res.status(404).send('Venta no encontrada');
        }
        const venta = ventaRes.rows[0];
        const detalleQuery = `
            SELECT dv."Cantidad", dv."PrecioUnitario", dv."Subtotal",
                   COALESCE(a."NomArticulo", c."Nombre", 'Producto borrado') as "Producto"
            FROM "DetalleVentas" dv
            LEFT JOIN "Articulos" a ON dv."IdArticulo" = a."IdArticulo"
            LEFT JOIN "Combos" c ON dv."IdCombo" = c."IdCombo"
            WHERE dv."IdVenta" = $1
        `;
        const detalleRes = await client.query(detalleQuery, [id]);
        const productos = detalleRes.rows;
        const doc = new PDFDocument({
            size: [227, 4000],
            margin: 10,
            bufferPages: true
        });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=ticket-${id}.pdf`);
        doc.pipe(res);
        // --- DISEÑO DEL TICKET ---
        // A. LOGO Y CABECERA
        let logoImpreso = false;
        if (config.LogoUrl) {
            const logoPath = path.join(__dirname, '../public/assets/', config.LogoUrl);
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, (227 - 100) / 2, doc.y, { width: 100 });
                doc.moveDown(0.5);
                logoImpreso = true;
            }
        }
        if (!logoImpreso) {
            doc.font('Helvetica-Bold').fontSize(16).text(config.NombreTienda || 'Aura Creativa', { align: 'center' });
        }
        doc.font('Helvetica').fontSize(8);
        if (config.Direccion) doc.text(config.Direccion, { align: 'center' });
        if (config.RedSocial) doc.text(config.RedSocial, { align: 'center' });
        if (config.Telefono) doc.text(`Tel: ${config.Telefono}`, { align: 'center' });
        doc.text('-------------------------------------', { align: 'center' });
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(9);
        doc.text(`Folio: #${venta.IdVenta}`);
        const fechaFormateada = new Date(venta.Fecha).toLocaleString('es-MX', {
            day: 'numeric', month: 'numeric', year: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true
        });
        doc.text(`Fecha: ${fechaFormateada}`);
        doc.text(`Cliente: ${venta.ClienteNombre || 'Público General'}`);
        doc.text(`Le atendió: ${venta.Vendedor || 'General'}`);
        doc.moveDown(0.5);
        // B. TABLA DE PRODUCTOS
        const yStart = doc.y;
        doc.font('Helvetica-Bold').fontSize(8);
        doc.text('Cant', 5, yStart);
        doc.text('Prod', 35, yStart);
        doc.text('P.U.', 140, yStart, { align: 'right', width: 40 });
        doc.text('Total', 180, yStart, { align: 'right', width: 40 });
        doc.font('Helvetica');
        doc.moveDown(0.3);
        productos.forEach(item => {
            const y = doc.y;
            doc.text(item.Cantidad, 5, y);
            const nombre = item.Producto.substring(0, 20); 
            doc.text(nombre, 35, y);
            doc.text(`$${Number(item.PrecioUnitario).toFixed(2)}`, 140, y, { align: 'right', width: 40 });
            doc.text(`$${Number(item.Subtotal).toFixed(2)}`, 180, y, { align: 'right', width: 40 });
            doc.moveDown(0.3);
        });
        doc.moveDown(0.5);
        // C. TOTALES
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text(`TOTAL: $${Number(venta.Total).toFixed(2)}`, 10, doc.y, { align: 'right', width: 207 });
        doc.moveDown(1);
        // D. PIE DE PÁGINA
        doc.font('Helvetica-Oblique').fontSize(9);
        doc.text(config.MensajeTicket || 'Gracias por su preferencia', { align: 'center' });
        doc.text('*********', { align: 'center' });
        doc.moveDown(0.5);
        // E. CÓDIGO QR
        if (venta.LinkGoogleMaps) {
            doc.font('Helvetica').fontSize(8);
            doc.text('Escanea para ver la ubicación:', { align: 'center' });
            doc.moveDown(0.2);
            const qrDataUrl = await QRCode.toDataURL(venta.LinkGoogleMaps, { errorCorrectionLevel: 'M' });
            doc.image(qrDataUrl, (227 - 100) / 2, doc.y, { width: 100 });
        }
        doc.end();

    } catch (error) {
        console.error('Error generando ticket:', error);
        res.status(500).send('Error al generar el ticket');
    } finally {
        client.release();
    }
};